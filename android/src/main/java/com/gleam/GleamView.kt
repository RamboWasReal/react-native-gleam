package com.gleam

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Shader
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup

class GleamView(context: Context) : ReactViewGroup(context) {

    enum class Direction { LTR, RTL, TTB }

    var loading: Boolean = true
        set(value) {
            if (field != value) {
                val wasLoading = field
                field = value
                applyLoadingState(wasLoading)
            }
        }

    var speed: Float = 1000f
        set(value) {
            if (field != value) {
                field = value
                if (loading) {
                    startAnimation()
                }
            }
        }

    var direction: Direction = Direction.LTR
        set(value) {
            if (field != value) {
                field = value
                if (loading) {
                    startAnimation()
                }
            }
        }

    var delay: Float = 0f
        set(value) {
            if (field != value) {
                field = value
                if (loading) {
                    startAnimation()
                }
            }
        }

    var animateDuration: Float = 300f
        set(value) {
            if (field != value) {
                field = value
            }
        }

    var intensity: Float = 1f
        set(value) {
            if (field != value) {
                field = value.coerceIn(0f, 1f)
                invalidate()
            }
        }

    var baseColor: Int = 0xFFE0E0E0.toInt()
        set(value) {
            if (field != value) {
                field = value
                invalidate()
            }
        }

    var highlightColor: Int = 0xFFF5F5F5.toInt()
        set(value) {
            if (field != value) {
                field = value
                invalidate()
            }
        }

    private val shimmerPaint = Paint()
    private val gradientColors = IntArray(3)
    private val gradientPositions = floatArrayOf(0f, 0.5f, 1f)
    private val gradientCoords = FloatArray(4)
    private var shimmerAnimator: ValueAnimator? = null
    private var transitionAnimator: ValueAnimator? = null
    private var animationProgress: Float = 0f
    private var shimmerOpacity: Float = 1f
    private var contentOpacity: Float = 0f
    private var isTransitioning: Boolean = false

    init {
        setWillNotDraw(false)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (loading) {
            startAnimation()
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopAnimation()
        transitionAnimator?.cancel()
        transitionAnimator = null
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (loading && w > 0 && h > 0) {
            startAnimation()
        }
    }

    override fun dispatchDraw(canvas: Canvas) {
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        // Draw children with content opacity
        if (contentOpacity > 0f) {
            if (contentOpacity < 1f) {
                val count = canvas.saveLayerAlpha(0f, 0f, w, h, (contentOpacity * 255).toInt())
                super.dispatchDraw(canvas)
                canvas.restoreToCount(count)
            } else {
                super.dispatchDraw(canvas)
            }
        }

        // Draw shimmer overlay
        if ((loading || isTransitioning) && shimmerOpacity > 0f) {
            val effectiveHighlight = if (intensity < 1f) {
                blendColor(baseColor, highlightColor, intensity)
            } else {
                highlightColor
            }

            gradientColors[0] = baseColor
            gradientColors[1] = effectiveHighlight
            gradientColors[2] = baseColor

            when (direction) {
                Direction.LTR -> {
                    val size = w
                    val s = -size + (animationProgress * (w + 2 * size))
                    gradientCoords[0] = s; gradientCoords[1] = 0f
                    gradientCoords[2] = s + size; gradientCoords[3] = 0f
                }
                Direction.RTL -> {
                    val size = w
                    val s = w + size - (animationProgress * (w + 2 * size))
                    gradientCoords[0] = s; gradientCoords[1] = 0f
                    gradientCoords[2] = s - size; gradientCoords[3] = 0f
                }
                Direction.TTB -> {
                    val size = h
                    val s = -size + (animationProgress * (h + 2 * size))
                    gradientCoords[0] = 0f; gradientCoords[1] = s
                    gradientCoords[2] = 0f; gradientCoords[3] = s + size
                }
            }

            shimmerPaint.shader = LinearGradient(
                gradientCoords[0], gradientCoords[1],
                gradientCoords[2], gradientCoords[3],
                gradientColors, gradientPositions,
                Shader.TileMode.CLAMP
            )
            shimmerPaint.alpha = (shimmerOpacity * 255).toInt()
            canvas.drawRect(0f, 0f, w, h, shimmerPaint)
        }
    }

    private fun blendColor(from: Int, to: Int, ratio: Float): Int {
        val r = Color.red(from) + ((Color.red(to) - Color.red(from)) * ratio).toInt()
        val g = Color.green(from) + ((Color.green(to) - Color.green(from)) * ratio).toInt()
        val b = Color.blue(from) + ((Color.blue(to) - Color.blue(from)) * ratio).toInt()
        val a = Color.alpha(from) + ((Color.alpha(to) - Color.alpha(from)) * ratio).toInt()
        return Color.argb(a, r, g, b)
    }

    private fun applyLoadingState(wasLoading: Boolean) {
        if (loading) {
            transitionAnimator?.cancel()
            transitionAnimator = null
            isTransitioning = false
            contentOpacity = 0f
            shimmerOpacity = 1f
            startAnimation()
            invalidate()
        } else {
            if (wasLoading && animateDuration > 0f) {
                isTransitioning = true
                transitionAnimator?.cancel()
                transitionAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
                    duration = animateDuration.toLong()
                    interpolator = DecelerateInterpolator()
                    addUpdateListener { animation ->
                        val progress = animation.animatedValue as Float
                        contentOpacity = progress
                        shimmerOpacity = 1f - progress
                        invalidate()
                    }
                    addListener(object : android.animation.AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: android.animation.Animator) {
                            isTransitioning = false
                            stopAnimation()
                            contentOpacity = 1f
                            shimmerOpacity = 0f
                            invalidate()
                            emitTransitionEnd(true)
                        }
                    })
                    start()
                }
            } else {
                stopAnimation()
                contentOpacity = 1f
                shimmerOpacity = 0f
                invalidate()
                emitTransitionEnd(true)
            }
        }
    }

    private fun emitTransitionEnd(finished: Boolean) {
        val reactContext = context as? ReactContext ?: return
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id) ?: return
        val surfaceId = UIManagerHelper.getSurfaceId(this)
        dispatcher.dispatchEvent(TransitionEndEvent(surfaceId, id, finished))
    }

    private fun startAnimation() {
        stopAnimation()

        val size = if (direction == Direction.TTB) height else width
        if (size <= 0) return

        shimmerAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = speed.toLong()
            repeatCount = ValueAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            startDelay = delay.toLong()
            addUpdateListener { animation ->
                animationProgress = animation.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    private fun stopAnimation() {
        shimmerAnimator?.cancel()
        shimmerAnimator = null
        animationProgress = 0f
    }

    class TransitionEndEvent(
        surfaceId: Int,
        viewId: Int,
        private val finished: Boolean
    ) : Event<TransitionEndEvent>(surfaceId, viewId) {
        override fun getEventName() = "topTransitionEnd"
        override fun getEventData(): WritableMap {
            return Arguments.createMap().apply {
                putBoolean("finished", finished)
            }
        }
    }
}
