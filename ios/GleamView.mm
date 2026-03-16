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

static NSMutableSet<GleamView *> *_registeredViews;
static CADisplayLink *_displayLink;

static void _ensureDisplayLink(void) {
    if (!_registeredViews) {
        _registeredViews = [NSMutableSet new];
    }
}

static void _startDisplayLinkIfNeeded(void) {
    if (_displayLink) return;
    _displayLink = [CADisplayLink displayLinkWithTarget:[GleamView class] selector:@selector(_onFrame:)];
    [_displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
}

static void _stopDisplayLinkIfNeeded(void) {
    if (_registeredViews.count > 0) return;
    [_displayLink invalidate];
    _displayLink = nil;
}

static void _registerView(GleamView *view) {
    _ensureDisplayLink();
    [_registeredViews addObject:view];
    _startDisplayLinkIfNeeded();
}

static void _unregisterView(GleamView *view) {
    [_registeredViews removeObject:view];
    _stopDisplayLinkIfNeeded();
}

#pragma mark - GleamView

@implementation GleamView {
    UIView *_contentView;
    CAGradientLayer *_shimmerLayer;
    BOOL _loading;
    BOOL _wasLoading;
    BOOL _isRegistered;
    CGFloat _speed;
    CGFloat _delay;
    CGFloat _transitionDuration;
    NSInteger _transitionTypeValue; // 0=fade, 1=slide, 2=dissolve, 3=scale
    CGFloat _intensity;
    GleamDirection _direction;
    UIColor *_baseColor;
    UIColor *_highlightColor;

    // Transition state
    BOOL _isTransitioning;
    CGFloat _transitionElapsed;
    CGFloat _shimmerOpacity;
    CGFloat _contentAlpha;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<GleamViewComponentDescriptor>();
}

+ (void)_onFrame:(CADisplayLink *)link
{
    NSArray *views = [_registeredViews allObjects];
    for (GleamView *view in views) {
        [view _tick];
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

        _contentView = [[UIView alloc] init];
        _contentView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

        _shimmerLayer = [CAGradientLayer layer];
        // Disable implicit animations on the gradient layer
        _shimmerLayer.actions = @{
            @"startPoint": [NSNull null],
            @"endPoint": [NSNull null],
            @"opacity": [NSNull null],
            @"bounds": [NSNull null],
            @"position": [NSNull null],
            @"transform": [NSNull null],
        };

        self.contentView = _contentView;
    }
    return self;
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    _shimmerLayer.frame = self.bounds;
    _shimmerLayer.cornerRadius = self.layer.cornerRadius;
    _shimmerLayer.maskedCorners = self.layer.maskedCorners;

    if (_loading && !_isRegistered) {
        [self _registerClock];
    }
}

- (void)removeFromSuperview
{
    [self _unregisterClock];
    [super removeFromSuperview];
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
        _speed = newViewProps.speed / 1000.0;
    }

    if (oldViewProps.delay != newViewProps.delay) {
        _delay = newViewProps.delay / 1000.0;
    }

    if (oldViewProps.transitionDuration != newViewProps.transitionDuration) {
        _transitionDuration = newViewProps.transitionDuration / 1000.0;
    }

    if (oldViewProps.transitionType != newViewProps.transitionType) {
        auto tt = newViewProps.transitionType;
        if (tt == GleamViewTransitionType::Shrink) _transitionTypeValue = 1;
        else if (tt == GleamViewTransitionType::Collapse) _transitionTypeValue = 2;
        else _transitionTypeValue = 0;
    }

    if (oldViewProps.intensity != newViewProps.intensity) {
        _intensity = fmin(fmax(newViewProps.intensity, 0.0), 1.0);
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

    if (oldViewProps.baseColor != newViewProps.baseColor) {
        UIColor *color = RCTUIColorFromSharedColor(newViewProps.baseColor);
        _baseColor = color ?: [UIColor colorWithRed:0.878 green:0.878 blue:0.878 alpha:1.0];
    }

    if (oldViewProps.highlightColor != newViewProps.highlightColor) {
        UIColor *color = RCTUIColorFromSharedColor(newViewProps.highlightColor);
        _highlightColor = color ?: [UIColor colorWithRed:0.961 green:0.961 blue:0.961 alpha:1.0];
    }

    if (oldViewProps.loading != newViewProps.loading) {
        _loading = newViewProps.loading;
    }

    [self _updateShimmerColors];
    [self _applyLoadingState];

    [super updateProps:props oldProps:oldProps];
}

#pragma mark - Private

/**
 * Compute shimmer progress from global time.
 * All views with same speed/delay share the same progress value.
 * Uses cosine easing for smooth looping (matches AccelerateDecelerateInterpolator).
 */
- (CGFloat)_computeProgress
{
    CFTimeInterval time = CACurrentMediaTime();
    CGFloat effectiveTime = fmax(time - _delay, 0.0);
    CGFloat rawProgress = fmod(effectiveTime, _speed) / _speed;
    // Cosine easing: (1 - cos(rawProgress * PI)) / 2
    return (1.0 - cos(rawProgress * M_PI)) / 2.0;
}

- (void)_tick
{
    if (_isTransitioning) {
        _transitionElapsed += _displayLink.duration;
        CGFloat t = fmin(_transitionElapsed / _transitionDuration, 1.0);
        // Ease out
        CGFloat eased = 1.0 - (1.0 - t) * (1.0 - t);

        switch (_transitionTypeValue) {
            case 1: { // Shrink — scale down with mask clipping
                _contentAlpha = eased;
                _contentView.alpha = _contentAlpha;
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
                mask.path = [UIBezierPath bezierPathWithRoundedRect:CGRectMake(x, y, fmax(w, 0.1), fmax(h, 0.1)) cornerRadius:self.layer.cornerRadius * scale].CGPath;
                break;
            }
            case 2: { // Collapse — vertically then horizontally via clip rect
                _contentAlpha = eased;
                _contentView.alpha = _contentAlpha;
                CGFloat collapseOpacity = 1.0 - fmin(eased * 2.5, 1.0);
                _shimmerLayer.opacity = collapseOpacity;
                CGRect bounds = self.bounds;
                CGFloat scaleY = eased < 0.6 ? 1.0 - (eased / 0.6) * 0.98 : 0.02;
                CGFloat scaleX = eased < 0.6 ? 1.0 : 1.0 - ((eased - 0.6) / 0.4);
                CGFloat w = bounds.size.width * scaleX;
                CGFloat h = bounds.size.height * scaleY;
                CGFloat x = (bounds.size.width - w) / 2.0;
                CGFloat y = (bounds.size.height - h) / 2.0;

                // Use a mask layer to clip the shimmer to the collapsing rect
                CAShapeLayer *mask = (CAShapeLayer *)_shimmerLayer.mask;
                if (!mask) {
                    mask = [CAShapeLayer layer];
                    mask.actions = @{@"path": [NSNull null]};
                    _shimmerLayer.mask = mask;
                }
                mask.path = [UIBezierPath bezierPathWithRoundedRect:CGRectMake(x, y, fmax(w, 0.1), fmax(h, 0.1)) cornerRadius:self.layer.cornerRadius].CGPath;
                break;
            }
            default: // Fade
                _contentAlpha = eased;
                _contentView.alpha = _contentAlpha;
                _shimmerOpacity = 1.0 - eased;
                _shimmerLayer.opacity = _shimmerOpacity;
                break;
        }

        [self _updateGradientPosition];

        if (t >= 1.0) {
            [self _finishTransition];
        }
    } else if (_loading) {
        [self _updateGradientPosition];
    }
}

- (void)_updateGradientPosition
{
    CGFloat progress = [self _computeProgress];

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
        CGFloat br, bg, bb, ba;
        CGFloat hr, hg, hb, ha;
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
    _shimmerLayer.locations = @[@0.0, @0.5, @1.0];
}

- (void)_applyLoadingState
{
    if (_loading) {
        _isTransitioning = NO;
        _contentAlpha = 0.0;
        _shimmerOpacity = 1.0;
        _contentView.alpha = 0.0;
        _shimmerLayer.opacity = 1.0;
        _shimmerLayer.frame = self.bounds;
        if (_shimmerLayer.superlayer != self.layer) {
            [self.layer addSublayer:_shimmerLayer];
        }
        [self _registerClock];
        _wasLoading = YES;
    } else {
        BOOL shouldAnimate = _wasLoading && _transitionDuration > 0;
        _wasLoading = NO;

        if (shouldAnimate) {
            _isTransitioning = YES;
            _transitionElapsed = 0.0;
            // Clock stays registered to drive the transition
        } else {
            [self _unregisterClock];
            _contentView.alpha = 1.0;
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
    _contentView.alpha = 1.0;
    _shimmerLayer.opacity = 0.0;
    _shimmerLayer.transform = CATransform3DIdentity;
    _shimmerLayer.mask = nil;
    _shimmerLayer.frame = self.bounds;
    [_shimmerLayer removeFromSuperlayer];
    [self _updateShimmerColors]; // Reset colors after dissolve
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
