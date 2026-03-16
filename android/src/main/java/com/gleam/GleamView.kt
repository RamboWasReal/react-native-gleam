package com.gleam

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import android.os.SystemClock
import android.view.Choreographer
import android.view.animation.DecelerateInterpolator
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup
import kotlin.math.cos
import kotlin.math.PI

class GleamView(context: Context) : ReactViewGroup(context) {

    enum class Direction { LTR, RTL, TTB }
    enum class TransitionType { FADE, SHRINK, COLLAPSE }

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
            }
        }

    var direction: Direction = Direction.LTR
        set(value) {
            if (field != value) {
                field = value
            }
        }

    var delay: Float = 0f
        set(value) {
            if (field != value) {
                field = value
            }
        }

    var transitionDuration: Float = 300f
        set(value) {
            if (field != value) {
                field = value
            }
        }

    var transitionType: TransitionType = TransitionType.FADE
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
    private val clipPath = Path()
    private val clipRect = RectF()
    internal var cornerRadius: Float = 0f
    private var transitionAnimator: ValueAnimator? = null
    private var shimmerOpacity: Float = 1f
    private var contentOpacity: Float = 0f
    private var isTransitioning: Boolean = false
    private var transitionProgress: Float = 0f
    private var isRegistered: Boolean = false

    init {
        setWillNotDraw(false)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (loading) {
            registerClock()
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        unregisterClock()
        transitionAnimator?.cancel()
        transitionAnimator = null
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (loading && w > 0 && h > 0 && !isRegistered) {
            registerClock()
        }
    }

    private fun registerClock() {
        if (!isRegistered) {
            isRegistered = true
            SharedClock.register(this)
        }
    }

    private fun unregisterClock() {
        if (isRegistered) {
            isRegistered = false
            SharedClock.unregister(this)
        }
    }

    /** Called by SharedClock every frame */
    fun onFrame() {
        invalidate()
    }

    /**
     * Compute progress from global time.
     * Uses cosine easing: progress = (1 - cos(phase)) / 2
     * This matches AccelerateDecelerateInterpolator and ensures smooth looping.
     */
    private fun computeProgress(): Float {
        val timeMs = SystemClock.uptimeMillis().toFloat()
        val effectiveTime = (timeMs - delay).coerceAtLeast(0f)
        val rawProgress = (effectiveTime % speed) / speed
        // AccelerateDecelerateInterpolator equivalent: (cos((x + 1) * PI) / 2) + 0.5
        return ((cos((rawProgress + 1.0) * PI) / 2.0) + 0.5).toFloat()
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
            val animationProgress = computeProgress()

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

            // Shrink: scale down, fade starts at 30%
            if (isTransitioning && transitionType == TransitionType.SHRINK) {
                val scale = 1f - transitionProgress * 0.5f
                val shrinkOpacity = (1f - transitionProgress * 2.5f).coerceAtLeast(0f)
                shimmerPaint.alpha = (shrinkOpacity * 255).toInt()
                canvas.save()
                canvas.scale(scale, scale, w / 2f, h / 2f)
            }

            // Collapse: vertically then horizontally, with opacity fade
            if (isTransitioning && transitionType == TransitionType.COLLAPSE) {
                val p = transitionProgress
                val scaleY = if (p < 0.6f) 1f - (p / 0.6f) * 0.98f else 0.02f
                val scaleX = if (p < 0.6f) 1f else 1f - ((p - 0.6f) / 0.4f)
                val collapseOpacity = (1f - p * 2.5f).coerceAtLeast(0f)
                shimmerPaint.alpha = (collapseOpacity * 255).toInt()
                canvas.save()
                canvas.scale(scaleX, scaleY, w / 2f, h / 2f)
            }

            if (cornerRadius > 0f) {
                val r = PixelUtil.toPixelFromDIP(cornerRadius)
                val count = canvas.save()
                clipPath.reset()
                clipRect.set(0f, 0f, w, h)
                clipPath.addRoundRect(clipRect, r, r, Path.Direction.CW)
                canvas.clipPath(clipPath)
                canvas.drawRect(0f, 0f, w, h, shimmerPaint)
                canvas.restoreToCount(count)
            } else {
                canvas.drawRect(0f, 0f, w, h, shimmerPaint)
            }

            // Restore scale/CRT transform
            if (isTransitioning && (transitionType == TransitionType.SHRINK || transitionType == TransitionType.COLLAPSE)) {
                canvas.restore()
            }
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
            registerClock()
            invalidate()
        } else {
            if (wasLoading && transitionDuration > 0f) {
                isTransitioning = true
                transitionAnimator?.cancel()

                transitionAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
                    duration = transitionDuration.toLong()
                    interpolator = DecelerateInterpolator()
                    addUpdateListener { anim ->
                        val p = anim.animatedValue as Float
                        transitionProgress = p
                        contentOpacity = p
                        shimmerOpacity = 1f - p
                        invalidate()
                    }
                    addListener(object : android.animation.AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: android.animation.Animator) {
                            finishTransition()
                        }
                    })
                    start()
                }
            } else {
                unregisterClock()
                contentOpacity = 1f
                shimmerOpacity = 0f
                invalidate()
                emitTransitionEnd(true)
            }
        }
    }

    private fun finishTransition() {
        isTransitioning = false
        unregisterClock()
        contentOpacity = 1f
        shimmerOpacity = 0f
        invalidate()
        emitTransitionEnd(true)
    }

    private fun emitTransitionEnd(finished: Boolean) {
        val reactContext = context as? ReactContext ?: return
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id) ?: return
        val surfaceId = UIManagerHelper.getSurfaceId(this)
        dispatcher.dispatchEvent(TransitionEndEvent(surfaceId, id, finished))
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

    /**
     * Shared Choreographer-based clock that drives all GleamView instances.
     * Views with the same speed/delay are automatically in sync because
     * they compute progress from the same global timestamp.
     */
    companion object SharedClock {
        private val views = mutableSetOf<GleamView>()
        private var frameCallback: Choreographer.FrameCallback? = null

        fun register(view: GleamView) {
            views.add(view)
            if (views.size == 1) start()
        }

        fun unregister(view: GleamView) {
            views.remove(view)
            if (views.isEmpty()) stop()
        }

        private fun start() {
            frameCallback = Choreographer.FrameCallback { _ ->
                views.forEach { it.onFrame() }
                frameCallback?.let { Choreographer.getInstance().postFrameCallback(it) }
            }
            Choreographer.getInstance().postFrameCallback(frameCallback!!)
        }

        private fun stop() {
            frameCallback?.let { Choreographer.getInstance().removeFrameCallback(it) }
            frameCallback = null
        }
    }
}
