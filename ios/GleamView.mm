#import "GleamView.h"

#import <QuartzCore/QuartzCore.h>
#import <React/RCTConversions.h>

#import <react/renderer/components/GleamViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/GleamViewSpec/EventEmitters.h>
#import <react/renderer/components/GleamViewSpec/Props.h>
#import <react/renderer/components/GleamViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

static NSString *const kShimmerAnimationKey = @"shimmerAnimation";

typedef NS_ENUM(NSInteger, GleamDirection) {
    GleamDirectionLTR = 0,
    GleamDirectionRTL,
    GleamDirectionTTB,
};

@implementation GleamView {
    UIView *_contentView;
    CAGradientLayer *_shimmerLayer;
    BOOL _loading;
    BOOL _wasLoading;
    CGFloat _speed;
    CGFloat _delay;
    CGFloat _animateDuration;
    CGFloat _intensity;
    GleamDirection _direction;
    UIColor *_baseColor;
    UIColor *_highlightColor;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<GleamViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const GleamViewProps>();
        _props = defaultProps;

        _loading = YES;
        _wasLoading = YES;
        _speed = 1.0;
        _delay = 0.0;
        _animateDuration = 0.3;
        _intensity = 1.0;
        _direction = GleamDirectionLTR;
        _baseColor = [UIColor colorWithRed:0.878 green:0.878 blue:0.878 alpha:1.0];
        _highlightColor = [UIColor colorWithRed:0.961 green:0.961 blue:0.961 alpha:1.0];

        _contentView = [[UIView alloc] init];
        _contentView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

        _shimmerLayer = [CAGradientLayer layer];

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

    if (_loading) {
        [self _startAnimationIfNeeded];
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

    if (oldViewProps.animateDuration != newViewProps.animateDuration) {
        _animateDuration = newViewProps.animateDuration / 1000.0;
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

- (void)_updateShimmerColors
{
    // Blend highlightColor toward baseColor based on intensity
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
        _contentView.alpha = 0.0;
        _shimmerLayer.opacity = 1.0;
        _shimmerLayer.frame = self.bounds;
        if (_shimmerLayer.superlayer != self.layer) {
            [self.layer addSublayer:_shimmerLayer];
        }
        [self _startAnimationIfNeeded];
        _wasLoading = YES;
    } else {
        BOOL shouldAnimate = _wasLoading && _animateDuration > 0;
        _wasLoading = NO;

        if (shouldAnimate) {
            CABasicAnimation *fadeOut = [CABasicAnimation animationWithKeyPath:@"opacity"];
            fadeOut.fromValue = @1.0;
            fadeOut.toValue = @0.0;
            fadeOut.duration = _animateDuration;
            fadeOut.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut];
            fadeOut.fillMode = kCAFillModeForwards;
            fadeOut.removedOnCompletion = NO;
            [_shimmerLayer addAnimation:fadeOut forKey:@"fadeOut"];

            [UIView animateWithDuration:_animateDuration
                                  delay:0
                                options:UIViewAnimationOptionCurveEaseOut
                             animations:^{
                self->_contentView.alpha = 1.0;
            } completion:^(BOOL finished) {
                [self->_shimmerLayer removeAnimationForKey:kShimmerAnimationKey];
                [self->_shimmerLayer removeAnimationForKey:@"fadeOut"];
                [self->_shimmerLayer removeFromSuperlayer];
                [self _emitTransitionEnd:finished];
            }];
        } else {
            _contentView.alpha = 1.0;
            [_shimmerLayer removeAnimationForKey:kShimmerAnimationKey];
            [_shimmerLayer removeFromSuperlayer];
            [self _emitTransitionEnd:YES];
        }
    }
}

- (void)_emitTransitionEnd:(BOOL)finished
{
    if (!_eventEmitter) {
        return;
    }
    auto emitter = std::static_pointer_cast<const GleamViewEventEmitter>(_eventEmitter);
    emitter->onTransitionEnd(GleamViewEventEmitter::OnTransitionEnd{.finished = finished});
}

- (void)_startAnimationIfNeeded
{
    if (!_loading || CGRectIsEmpty(self.bounds)) {
        return;
    }

    [_shimmerLayer removeAnimationForKey:kShimmerAnimationKey];

    CGPoint fromStart, toStart, fromEnd, toEnd;

    switch (_direction) {
        case GleamDirectionRTL:
            fromStart = CGPointMake(2.0, 0.5);
            toStart   = CGPointMake(0.0, 0.5);
            fromEnd   = CGPointMake(1.0, 0.5);
            toEnd     = CGPointMake(-1.0, 0.5);
            break;
        case GleamDirectionTTB:
            fromStart = CGPointMake(0.5, -1.0);
            toStart   = CGPointMake(0.5, 1.0);
            fromEnd   = CGPointMake(0.5, 0.0);
            toEnd     = CGPointMake(0.5, 2.0);
            break;
        case GleamDirectionLTR:
        default:
            fromStart = CGPointMake(-1.0, 0.5);
            toStart   = CGPointMake(1.0, 0.5);
            fromEnd   = CGPointMake(0.0, 0.5);
            toEnd     = CGPointMake(2.0, 0.5);
            break;
    }

    CABasicAnimation *startPointAnim = [CABasicAnimation animationWithKeyPath:@"startPoint"];
    startPointAnim.fromValue = [NSValue valueWithCGPoint:fromStart];
    startPointAnim.toValue = [NSValue valueWithCGPoint:toStart];

    CABasicAnimation *endPointAnim = [CABasicAnimation animationWithKeyPath:@"endPoint"];
    endPointAnim.fromValue = [NSValue valueWithCGPoint:fromEnd];
    endPointAnim.toValue = [NSValue valueWithCGPoint:toEnd];

    CAAnimationGroup *group = [CAAnimationGroup animation];
    group.animations = @[startPointAnim, endPointAnim];
    group.duration = _speed;
    group.repeatCount = HUGE_VALF;
    group.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];

    if (_delay > 0) {
        group.beginTime = CACurrentMediaTime() + _delay;
        group.fillMode = kCAFillModeBackwards;
    }

    [_shimmerLayer addAnimation:group forKey:kShimmerAnimationKey];
}

@end
