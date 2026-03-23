#import "GleamView.h"

#import <QuartzCore/QuartzCore.h>
#import <React/RCTConversions.h>

#import <react/renderer/components/GleamViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/GleamViewSpec/EventEmitters.h>
#import <react/renderer/components/GleamViewSpec/Props.h>
#import <react/renderer/components/GleamViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

typedef NS_ENUM(NSInteger, GleamDirection) {
    GleamDirectionLTR = 0,
    GleamDirectionRTL,
    GleamDirectionTTB,
};

#pragma mark - Shared Display Link Clock

// Plain C array for zero-alloc per-frame iteration.
// Cleanup is guaranteed via removeFromSuperview, prepareForRecycle, and dealloc.
static GleamView * __strong *_views = NULL;
static NSUInteger _viewCount = 0;
static NSUInteger _viewCapacity = 0;
static CADisplayLink *_displayLink;

static void _startDisplayLinkIfNeeded(void) {
    if (_displayLink) return;
    _displayLink = [CADisplayLink displayLinkWithTarget:[GleamView class] selector:@selector(_onFrame:)];
    if (@available(iOS 15.0, *)) {
        _displayLink.preferredFrameRateRange = CAFrameRateRangeMake(30, 60, 60);
    }
    [_displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
}

static void _stopDisplayLinkIfNeeded(void) {
    if (_viewCount > 0) return;
    [_displayLink invalidate];
    _displayLink = nil;
}

static void _registerView(GleamView *view) {
    // Check duplicate
    for (NSUInteger i = 0; i < _viewCount; i++) {
        if (_views[i] == view) return;
    }
    // Grow if needed
    if (_viewCount >= _viewCapacity) {
        NSUInteger newCap = _viewCapacity == 0 ? 16 : _viewCapacity * 2;
        GleamView * __strong *newBuf = (GleamView * __strong *)calloc(newCap, sizeof(GleamView *));
        if (!newBuf) return;
        if (_views) {
            for (NSUInteger i = 0; i < _viewCount; i++) {
                newBuf[i] = _views[i];
                _views[i] = nil;
            }
            free(_views);
        }
        _views = newBuf;
        _viewCapacity = newCap;
    }
    _views[_viewCount++] = view;
    _startDisplayLinkIfNeeded();
}

static void _unregisterView(GleamView *view) {
    for (NSUInteger i = 0; i < _viewCount; i++) {
        if (_views[i] == view) {
            _views[i] = nil;
            // Swap with last
            _views[i] = _views[_viewCount - 1];
            _views[_viewCount - 1] = nil;
            _viewCount--;
            break;
        }
    }
    _stopDisplayLinkIfNeeded();
}

#pragma mark - GleamView

@implementation GleamView {
    CAGradientLayer *_shimmerLayer;
    BOOL _loading;
    BOOL _wasLoading;
    BOOL _isRegistered;
    CGFloat _speed;
    CGFloat _delay;
    CGFloat _transitionDuration;
    NSInteger _transitionTypeValue; // 0=fade, 1=shrink, 2=collapse
    CGFloat _intensity;
    GleamDirection _direction;
    UIColor *_baseColor;
    UIColor *_highlightColor;

    // Transition state
    BOOL _isTransitioning;
    CGFloat _transitionElapsed;
    CGFloat _shimmerOpacity;
    CGFloat _contentAlpha;
    CGFloat _lastSetChildrenAlpha;
    BOOL _didInitialSetup;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<GleamViewComponentDescriptor>();
}

+ (void)_onFrame:(CADisplayLink *)link
{
    NSUInteger count = _viewCount;
    if (count == 0) return;
    CFTimeInterval now = CACurrentMediaTime();
    // Iterate by index — safe even if _tick triggers unregister (swap-remove)
    // Process in reverse to handle swap-remove correctly
    for (NSUInteger i = count; i > 0; i--) {
        if (i - 1 < _viewCount) {
            [_views[i - 1] _tickWithTime:now];
        }
    }
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const GleamViewProps>();
        _props = defaultProps;

        _loading = YES;
        _wasLoading = YES;
        _isRegistered = NO;
        _speed = 1.0;
        _delay = 0.0;
        _transitionDuration = 0.3;
        _transitionTypeValue = 0;
        _intensity = 1.0;
        _direction = GleamDirectionLTR;
        _baseColor = [UIColor colorWithRed:0.878 green:0.878 blue:0.878 alpha:1.0];
        _highlightColor = [UIColor colorWithRed:0.961 green:0.961 blue:0.961 alpha:1.0];

        _isTransitioning = NO;
        _shimmerOpacity = 1.0;
        _contentAlpha = 0.0;
        _lastSetChildrenAlpha = -1.0;
        _didInitialSetup = NO;

        _shimmerLayer = [CAGradientLayer layer];
        _shimmerLayer.actions = @{
            @"startPoint": [NSNull null],
            @"endPoint": [NSNull null],
            @"opacity": [NSNull null],
            @"bounds": [NSNull null],
            @"position": [NSNull null],
            @"transform": [NSNull null],
        };
        _shimmerLayer.locations = @[@0.0, @0.5, @1.0];
    }
    return self;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [super mountChildComponentView:childComponentView index:index];
    if (_loading || _isTransitioning) {
        childComponentView.alpha = _contentAlpha;
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    _shimmerLayer.frame = self.bounds;
    _shimmerLayer.cornerRadius = self.layer.cornerRadius;
    _shimmerLayer.maskedCorners = self.layer.maskedCorners;

    if (_loading) {
        if (_shimmerLayer.superlayer != self.layer) {
            [self.layer addSublayer:_shimmerLayer];
        }
        [self _registerClock];
    }
}

- (void)removeFromSuperview
{
    [self _unregisterClock];
    if (_isTransitioning) {
        _isTransitioning = NO;
    }
    // Reset to clean state based on loading
    CGFloat targetAlpha = _loading ? 0.0 : 1.0;
    _contentAlpha = targetAlpha;
    _lastSetChildrenAlpha = -1.0;
    for (UIView *subview in self.subviews) {
        subview.alpha = targetAlpha;
    }
    _lastSetChildrenAlpha = targetAlpha;
    _shimmerOpacity = _loading ? 1.0 : 0.0;
    _shimmerLayer.opacity = _shimmerOpacity;
    _shimmerLayer.mask = nil;
    _shimmerLayer.transform = CATransform3DIdentity;
    [_shimmerLayer removeFromSuperlayer];
    [super removeFromSuperview];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self _unregisterClock];
    _isTransitioning = NO;
    _shimmerLayer.mask = nil;
    _shimmerLayer.transform = CATransform3DIdentity;
    _shimmerLayer.opacity = 0.0;
    [_shimmerLayer removeFromSuperlayer];
    _contentAlpha = 0.0;
    _lastSetChildrenAlpha = -1.0;
    _shimmerOpacity = 1.0;
    _loading = YES;
    _wasLoading = YES;
    _didInitialSetup = NO;
}

// Invariant: a registered view (_isRegistered=YES) is held by the static
// __strong _views array, which prevents ARC dealloc while registered.
// Off-main dealloc with _isRegistered=YES should therefore be unreachable.
// If the invariant is violated in release, we skip _unregisterView to avoid
// racing on the statics (_views, _viewCount, _displayLink) that are read/written
// by the display link on the main thread. The view leaks in _views but no crash.
- (void)dealloc
{
    if (_isRegistered) {
        _isRegistered = NO;
        if ([NSThread isMainThread]) {
            _unregisterView(self);
        } else {
            NSAssert(NO, @"GleamView deallocated off main thread — static __strong array should prevent this");
        }
    }
}

- (void)_registerClock
{
    if (!_isRegistered) {
        _isRegistered = YES;
        _registerView(self);
    }
}

- (void)_unregisterClock
{
    if (_isRegistered) {
        _isRegistered = NO;
        _unregisterView(self);
    }
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<GleamViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<GleamViewProps const>(props);

    if (oldViewProps.speed != newViewProps.speed) {
        double s = newViewProps.speed / 1000.0;
        _speed = (isnan(s) || isinf(s) || s <= 0) ? 1.0 : fmax(s, 0.001);
    }

    if (oldViewProps.delay != newViewProps.delay) {
        double d = newViewProps.delay / 1000.0;
        _delay = (isnan(d) || isinf(d)) ? 0.0 : d;
    }

    if (oldViewProps.transitionDuration != newViewProps.transitionDuration) {
        double td = newViewProps.transitionDuration / 1000.0;
        _transitionDuration = (isnan(td) || isinf(td) || td < 0) ? 0.3 : td;
    }

    if (oldViewProps.transitionType != newViewProps.transitionType) {
        auto tt = newViewProps.transitionType;
        if (tt == GleamViewTransitionType::Shrink) _transitionTypeValue = 1;
        else if (tt == GleamViewTransitionType::Collapse) _transitionTypeValue = 2;
        else _transitionTypeValue = 0;
    }

    if (oldViewProps.direction != newViewProps.direction) {
        auto dir = newViewProps.direction;
        if (dir == GleamViewDirection::Rtl) {
            _direction = GleamDirectionRTL;
        } else if (dir == GleamViewDirection::Ttb) {
            _direction = GleamDirectionTTB;
        } else {
            _direction = GleamDirectionLTR;
        }
    }

    BOOL colorsChanged = NO;
    if (oldViewProps.intensity != newViewProps.intensity) {
        _intensity = fmin(fmax(newViewProps.intensity, 0.0), 1.0);
        colorsChanged = YES;
    }

    if (oldViewProps.baseColor != newViewProps.baseColor) {
        UIColor *color = RCTUIColorFromSharedColor(newViewProps.baseColor);
        _baseColor = color ?: [UIColor colorWithRed:0.878 green:0.878 blue:0.878 alpha:1.0];
        colorsChanged = YES;
    }

    if (oldViewProps.highlightColor != newViewProps.highlightColor) {
        UIColor *color = RCTUIColorFromSharedColor(newViewProps.highlightColor);
        _highlightColor = color ?: [UIColor colorWithRed:0.961 green:0.961 blue:0.961 alpha:1.0];
        colorsChanged = YES;
    }

    if (oldViewProps.loading != newViewProps.loading) {
        _loading = newViewProps.loading;
    }

    if (!_didInitialSetup) {
        _didInitialSetup = YES;
        [self _updateShimmerColors];
        if (_loading) {
            _wasLoading = YES;
            [self _applyLoadingState];
        } else {
            _wasLoading = NO;
            _contentAlpha = 1.0;
            _shimmerOpacity = 0.0;
            _lastSetChildrenAlpha = -1.0;
            for (UIView *subview in self.subviews) {
                subview.alpha = 1.0;
            }
            _lastSetChildrenAlpha = 1.0;
        }
    } else {
        if (colorsChanged) {
            [self _updateShimmerColors];
        }
        if (oldViewProps.loading != newViewProps.loading) {
            [self _applyLoadingState];
        }
    }

    [super updateProps:props oldProps:oldProps];
}

#pragma mark - Private

- (CGFloat)_computeProgressWithTime:(CFTimeInterval)now
{
    CGFloat effectiveTime = fmax(now - _delay, 0.0);
    CGFloat rawProgress = fmod(effectiveTime, _speed) / _speed;
    return (1.0 - cos(rawProgress * M_PI)) / 2.0;
}

- (void)_tickWithTime:(CFTimeInterval)now
{
    if (!self.window) return;

    if (_isTransitioning) {
        _transitionElapsed += _displayLink.duration;
        CGFloat t = _transitionDuration > 0 ? fmin(_transitionElapsed / _transitionDuration, 1.0) : 1.0;
        CGFloat eased = 1.0 - (1.0 - t) * (1.0 - t);

        switch (_transitionTypeValue) {
            case 1: { // Shrink
                [self _setChildrenAlphaIfNeeded:eased];
                CGFloat shrinkOpacity = 1.0 - fmin(eased * 2.5, 1.0);
                _shimmerLayer.opacity = shrinkOpacity;
                CGFloat scale = 1.0 - eased * 0.5;
                CGRect bounds = self.bounds;
                CGFloat w = bounds.size.width * scale;
                CGFloat h = bounds.size.height * scale;
                CGFloat x = (bounds.size.width - w) / 2.0;
                CGFloat y = (bounds.size.height - h) / 2.0;

                CAShapeLayer *mask = (CAShapeLayer *)_shimmerLayer.mask;
                if (!mask) {
                    mask = [CAShapeLayer layer];
                    mask.actions = @{@"path": [NSNull null]};
                    _shimmerLayer.mask = mask;
                }
                CGPathRef path = CGPathCreateWithRoundedRect(
                    CGRectMake(x, y, fmax(w, 0.1), fmax(h, 0.1)),
                    self.layer.cornerRadius * scale,
                    self.layer.cornerRadius * scale,
                    NULL);
                mask.path = path;
                CGPathRelease(path);
                break;
            }
            case 2: { // Collapse
                [self _setChildrenAlphaIfNeeded:eased];
                CGFloat collapseOpacity = 1.0 - fmin(eased * 2.5, 1.0);
                _shimmerLayer.opacity = collapseOpacity;
                CGRect bounds = self.bounds;
                CGFloat scaleY = eased < 0.6 ? 1.0 - (eased / 0.6) * 0.98 : 0.02;
                CGFloat scaleX = eased < 0.6 ? 1.0 : 1.0 - ((eased - 0.6) / 0.4);
                CGFloat w = bounds.size.width * scaleX;
                CGFloat h = bounds.size.height * scaleY;
                CGFloat x = (bounds.size.width - w) / 2.0;
                CGFloat y = (bounds.size.height - h) / 2.0;

                CAShapeLayer *mask = (CAShapeLayer *)_shimmerLayer.mask;
                if (!mask) {
                    mask = [CAShapeLayer layer];
                    mask.actions = @{@"path": [NSNull null]};
                    _shimmerLayer.mask = mask;
                }
                CGPathRef path = CGPathCreateWithRoundedRect(
                    CGRectMake(x, y, fmax(w, 0.1), fmax(h, 0.1)),
                    self.layer.cornerRadius,
                    self.layer.cornerRadius,
                    NULL);
                mask.path = path;
                CGPathRelease(path);
                break;
            }
            default: // Fade
                [self _setChildrenAlphaIfNeeded:eased];
                _shimmerOpacity = 1.0 - eased;
                _shimmerLayer.opacity = _shimmerOpacity;
                break;
        }

        [self _updateGradientPositionWithTime:now];

        if (t >= 1.0) {
            [self _finishTransition];
        }
    } else if (_loading) {
        [self _updateGradientPositionWithTime:now];
    }
}

- (void)_setChildrenAlphaIfNeeded:(CGFloat)alpha
{
    if (fabs(alpha - _lastSetChildrenAlpha) < 0.005) return;
    _lastSetChildrenAlpha = alpha;
    _contentAlpha = alpha;
    for (UIView *subview in self.subviews) {
        subview.alpha = alpha;
    }
}

- (void)_updateGradientPositionWithTime:(CFTimeInterval)now
{
    CGFloat progress = [self _computeProgressWithTime:now];

    CGPoint startPoint, endPoint;

    switch (_direction) {
        case GleamDirectionRTL: {
            CGFloat s = 2.0 - progress * 3.0;
            startPoint = CGPointMake(s, 0.5);
            endPoint = CGPointMake(s - 1.0, 0.5);
            break;
        }
        case GleamDirectionTTB: {
            CGFloat s = -1.0 + progress * 3.0;
            startPoint = CGPointMake(0.5, s);
            endPoint = CGPointMake(0.5, s + 1.0);
            break;
        }
        case GleamDirectionLTR:
        default: {
            CGFloat s = -1.0 + progress * 3.0;
            startPoint = CGPointMake(s, 0.5);
            endPoint = CGPointMake(s + 1.0, 0.5);
            break;
        }
    }

    _shimmerLayer.startPoint = startPoint;
    _shimmerLayer.endPoint = endPoint;
}

- (void)_updateShimmerColors
{
    UIColor *effectiveHighlight = _highlightColor;
    if (_intensity < 1.0) {
        CGFloat br = 0, bg = 0, bb = 0, ba = 1;
        CGFloat hr = 0, hg = 0, hb = 0, ha = 1;
        [_baseColor getRed:&br green:&bg blue:&bb alpha:&ba];
        [_highlightColor getRed:&hr green:&hg blue:&hb alpha:&ha];
        CGFloat r = br + (hr - br) * _intensity;
        CGFloat g = bg + (hg - bg) * _intensity;
        CGFloat b = bb + (hb - bb) * _intensity;
        CGFloat a = ba + (ha - ba) * _intensity;
        effectiveHighlight = [UIColor colorWithRed:r green:g blue:b alpha:a];
    }

    _shimmerLayer.colors = @[
        (id)_baseColor.CGColor,
        (id)effectiveHighlight.CGColor,
        (id)_baseColor.CGColor,
    ];
}

- (void)_applyLoadingState
{
    if (_loading) {
        if (_isTransitioning) {
            [self _emitTransitionEnd:NO];
        }
        _isTransitioning = NO;
        _contentAlpha = 0.0;
        _lastSetChildrenAlpha = -1.0;
        _shimmerOpacity = 1.0;
        for (UIView *subview in self.subviews) {
            subview.alpha = 0.0;
        }
        _lastSetChildrenAlpha = 0.0;
        _shimmerLayer.opacity = 1.0;
        _shimmerLayer.transform = CATransform3DIdentity;
        _shimmerLayer.mask = nil;
        _shimmerLayer.frame = self.bounds;
        if (_shimmerLayer.superlayer != self.layer) {
            [self.layer addSublayer:_shimmerLayer];
        }
        [self _updateShimmerColors];
        [self _registerClock];
        _wasLoading = YES;
    } else {
        BOOL shouldAnimate = _wasLoading && _transitionDuration > 0;
        _wasLoading = NO;

        if (shouldAnimate) {
            _isTransitioning = YES;
            _transitionElapsed = 0.0;
            [self _registerClock];
        } else {
            [self _unregisterClock];
            _lastSetChildrenAlpha = -1.0;
            for (UIView *subview in self.subviews) {
                subview.alpha = 1.0;
            }
            _lastSetChildrenAlpha = 1.0;
            _contentAlpha = 1.0;
            _shimmerLayer.opacity = 0.0;
            [_shimmerLayer removeFromSuperlayer];
            [self _emitTransitionEnd:YES];
        }
    }
}

- (void)_finishTransition
{
    _isTransitioning = NO;
    [self _unregisterClock];
    _lastSetChildrenAlpha = -1.0;
    for (UIView *subview in self.subviews) {
        subview.alpha = 1.0;
    }
    _lastSetChildrenAlpha = 1.0;
    _contentAlpha = 1.0;
    _shimmerLayer.opacity = 0.0;
    _shimmerLayer.transform = CATransform3DIdentity;
    _shimmerLayer.mask = nil;
    _shimmerLayer.frame = self.bounds;
    [_shimmerLayer removeFromSuperlayer];
    [self _emitTransitionEnd:YES];
}

- (void)_emitTransitionEnd:(BOOL)finished
{
    if (!_eventEmitter) {
        return;
    }
    auto emitter = std::static_pointer_cast<const GleamViewEventEmitter>(_eventEmitter);
    emitter->onTransitionEnd(GleamViewEventEmitter::OnTransitionEnd{.finished = finished});
}

@end
