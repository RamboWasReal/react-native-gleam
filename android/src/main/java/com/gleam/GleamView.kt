package com.gleam

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.os.SystemClock
import android.view.Choreographer
import android.view.animation.DecelerateInterpolator
import androidx.annotation.UiThread
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

    private var didAttach = false
    private var transitionGeneration = 0

    var loading: Boolean = true
        set(value) {
            if (field != value) {
                val wasLoading = field
                field = value
                if (didAttach) {
                    applyLoadingState(wasLoading)
                }
            }
        }

    var speed: Float = 1000f
        set(value) {
            if (field != value) {
                field = value.coerceAtLeast(1f)
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
                field = value.coerceAtLeast(0f)
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
                invalidateGradientCache()
                invalidate()
            }
        }

    var baseColor: Int = 0xFFE0E0E0.toInt()
        set(value) {
            if (field != value) {
                field = value
                invalidateGradientCache()
                invalidate()
            }
        }

    var highlightColor: Int = 0xFFF5F5F5.toInt()
        set(value) {
            if (field != value) {
                field = value
                invalidateGradientCache()
                invalidate()
            }
        }

    // Drawing objects — pre-allocated, reused every frame
    private val shimmerPaint = Paint()
    private val drawRect = RectF()
    private var transitionAnimator: ValueAnimator? = null
    private var shimmerOpacity: Float = 1f
    private var contentOpacity: Float = 0f
    private var isTransitioning: Boolean = false
    private var transitionProgress: Float = 0f
    private var isRegistered: Boolean = false

    // Cached gradient — only recreated when colors change
    private var cachedGradient: LinearGradient? = null
    private val shaderMatrix = Matrix()
    private var lastCachedBaseColor: Int = 0
    private var lastCachedHighlight: Int = 0

    // Cached corner radius in pixels — only recomputed when prop changes
    internal var cornerRadius: Float = 0f
        set(value) {
            if (field != value) {
                field = value
                cornerRadiusPx = PixelUtil.toPixelFromDIP(value)
            }
        }
    private var cornerRadiusPx: Float = 0f

    init {
        setWillNotDraw(false)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!didAttach) {
            didAttach = true
            if (loading) {
                registerClock()
            } else {
                contentOpacity = 1f
                shimmerOpacity = 0f
            }
        } else {
            // Re-attachment: restore correct state
            if (loading) {
                registerClock()
            } else if (!isTransitioning) {
                contentOpacity = 1f
                shimmerOpacity = 0f
            }
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        unregisterClock()
        isTransitioning = false
        transitionAnimator?.removeAllListeners()
        transitionAnimator?.cancel()
        transitionAnimator = null
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (loading && w > 0 && h > 0 && !isRegistered) {
            registerClock()
        }
    }

    /** Called by ViewManager when the view is dropped */
    fun cleanup() {
        unregisterClock()
        isTransitioning = false
        transitionAnimator?.removeAllListeners()
        transitionAnimator?.cancel()
        transitionAnimator = null
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

    /** Called by SharedClock every frame with current timestamp */
    internal var frameTimeMs: Float = 0f

    internal fun onFrame(timeMs: Float) {
        frameTimeMs = timeMs
        invalidate()
    }

    private fun invalidateGradientCache() {
        cachedGradient = null
    }

    private fun computeProgress(): Float {
        val timeMs = if (frameTimeMs > 0f) frameTimeMs else SystemClock.uptimeMillis().toFloat()
        val effectiveTime = (timeMs - delay).coerceAtLeast(0f)
        val rawProgress = (effectiveTime % speed) / speed
        return ((cos((rawProgress + 1.0) * PI) / 2.0) + 0.5).toFloat()
    }

    private fun ensureGradient(effectiveHighlight: Int) {
        if (cachedGradient != null && lastCachedBaseColor == baseColor && lastCachedHighlight == effectiveHighlight) {
            return
        }
        cachedGradient = LinearGradient(
            0f, 0f, 1f, 0f,
            intArrayOf(baseColor, effectiveHighlight, baseColor),
            floatArrayOf(0f, 0.5f, 1f),
            Shader.TileMode.CLAMP
        )
        lastCachedBaseColor = baseColor
        lastCachedHighlight = effectiveHighlight
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

            ensureGradient(effectiveHighlight)
            val gradient = cachedGradient ?: return

            // Position the gradient using a matrix instead of recreating it
            when (direction) {
                Direction.LTR -> {
                    val size = w
                    val s = -size + (animationProgress * (w + 2 * size))
                    shaderMatrix.setScale(size, h)
                    shaderMatrix.postTranslate(s, 0f)
                }
                Direction.RTL -> {
                    val size = w
                    val s = w + size - (animationProgress * (w + 2 * size))
                    shaderMatrix.setScale(-size, h)
                    shaderMatrix.postTranslate(s, 0f)
                }
                Direction.TTB -> {
                    val size = h
                    val s = -size + (animationProgress * (h + 2 * size))
                    shaderMatrix.setRotate(90f)
                    shaderMatrix.postScale(w, size)
                    shaderMatrix.postTranslate(0f, s)
                }
            }

            gradient.setLocalMatrix(shaderMatrix)
            shimmerPaint.shader = gradient
            shimmerPaint.alpha = (shimmerOpacity * 255).toInt()

            // Shrink: scale down, fast opacity fade
            if (isTransitioning && transitionType == TransitionType.SHRINK) {
                val scale = 1f - transitionProgress * 0.5f
                val shrinkOpacity = (1f - transitionProgress * 2.5f).coerceAtLeast(0f)
                shimmerPaint.alpha = (shrinkOpacity * 255).toInt()
                canvas.save()
                canvas.scale(scale, scale, w / 2f, h / 2f)
            }

            // Collapse: vertically then horizontally, with fast opacity fade
            if (isTransitioning && transitionType == TransitionType.COLLAPSE) {
                val p = transitionProgress
                val scaleY = if (p < 0.6f) 1f - (p / 0.6f) * 0.98f else 0.02f
                val scaleX = if (p < 0.6f) 1f else 1f - ((p - 0.6f) / 0.4f)
                val collapseOpacity = (1f - p * 2.5f).coerceAtLeast(0f)
                shimmerPaint.alpha = (collapseOpacity * 255).toInt()
                canvas.save()
                canvas.scale(scaleX, scaleY, w / 2f, h / 2f)
            }

            // Draw shimmer — use drawRoundRect instead of clipPath for hardware acceleration
            drawRect.set(0f, 0f, w, h)
            if (cornerRadiusPx > 0f) {
                canvas.drawRoundRect(drawRect, cornerRadiusPx, cornerRadiusPx, shimmerPaint)
            } else {
                canvas.drawRect(drawRect, shimmerPaint)
            }

            // Restore scale transform
            if (isTransitioning && (transitionType == TransitionType.SHRINK || transitionType == TransitionType.COLLAPSE)) {
                canvas.restore()
            }
        }
    }

    private fun blendColor(from: Int, to: Int, ratio: Float): Int {
        val r = (Color.red(from) + ((Color.red(to) - Color.red(from)) * ratio).toInt()).coerceIn(0, 255)
        val g = (Color.green(from) + ((Color.green(to) - Color.green(from)) * ratio).toInt()).coerceIn(0, 255)
        val b = (Color.blue(from) + ((Color.blue(to) - Color.blue(from)) * ratio).toInt()).coerceIn(0, 255)
        val a = (Color.alpha(from) + ((Color.alpha(to) - Color.alpha(from)) * ratio).toInt()).coerceIn(0, 255)
        return Color.argb(a, r, g, b)
    }

    private fun applyLoadingState(wasLoading: Boolean) {
        if (loading) {
            if (isTransitioning) {
                emitTransitionEnd(false)
            }
            // Set isTransitioning=false BEFORE cancel to prevent stale onAnimationEnd
            isTransitioning = false
            transitionGeneration++
            transitionAnimator?.cancel()
            transitionAnimator = null
            transitionProgress = 0f
            contentOpacity = 0f
            shimmerOpacity = 1f
            registerClock()
            invalidate()
        } else {
            if (wasLoading && transitionDuration > 0f) {
                isTransitioning = true
                // Unregister from shared clock — the ValueAnimator drives redraws during transition
                unregisterClock()
                val currentGen = ++transitionGeneration
                transitionAnimator?.cancel()

                transitionAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
                    duration = transitionDuration.toLong()
                    interpolator = DecelerateInterpolator(2f)
                    addUpdateListener { anim ->
                        if (transitionGeneration != currentGen) return@addUpdateListener
                        val p = anim.animatedValue as Float
                        transitionProgress = p
                        contentOpacity = p
                        shimmerOpacity = 1f - p
                        invalidate()
                    }
                    addListener(object : android.animation.AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: android.animation.Animator) {
                            if (transitionGeneration != currentGen) return
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
        if (!isTransitioning) return
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
        private val views = mutableListOf<GleamView>()
        private var frameCallback: Choreographer.FrameCallback? = null

        @UiThread
        fun register(view: GleamView) {
            if (!views.contains(view)) {
                views.add(view)
            }
            if (views.size == 1) start()
        }

        @UiThread
        fun unregister(view: GleamView) {
            views.remove(view)
            if (views.isEmpty()) stop()
        }

        private fun start() {
            frameCallback = Choreographer.FrameCallback { frameTimeNanos ->
                val timeMs = frameTimeNanos / 1_000_000f
                val snapshot = views.toList()
                for (i in snapshot.indices.reversed()) {
                    snapshot[i].onFrame(timeMs)
                }
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
