package com.gleam

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.GleamViewManagerInterface
import com.facebook.react.viewmanagers.GleamViewManagerDelegate

@ReactModule(name = GleamViewManager.NAME)
class GleamViewManager : ViewGroupManager<GleamView>(),
  GleamViewManagerInterface<GleamView> {

  private val mDelegate: ViewManagerDelegate<GleamView> = GleamViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<GleamView> = mDelegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): GleamView {
    return GleamView(context)
  }

  @ReactProp(name = "loading", defaultBoolean = true)
  override fun setLoading(view: GleamView, loading: Boolean) {
    view.loading = loading
  }

  @ReactProp(name = "speed", defaultFloat = 1000f)
  override fun setSpeed(view: GleamView, speed: Float) {
    view.speed = speed
  }

  @ReactProp(name = "delay", defaultFloat = 0f)
  override fun setDelay(view: GleamView, delay: Float) {
    view.delay = delay
  }

  @ReactProp(name = "transitionDuration", defaultFloat = 300f)
  override fun setTransitionDuration(view: GleamView, transitionDuration: Float) {
    view.transitionDuration = transitionDuration
  }

  @ReactProp(name = "transitionType")
  override fun setTransitionType(view: GleamView, transitionType: String?) {
    view.transitionType = when (transitionType) {
      "shrink" -> GleamView.TransitionType.SHRINK
      "collapse" -> GleamView.TransitionType.COLLAPSE
      else -> GleamView.TransitionType.FADE
    }
  }

  @ReactProp(name = "intensity", defaultFloat = 1f)
  override fun setIntensity(view: GleamView, intensity: Float) {
    view.intensity = intensity
  }

  @ReactProp(name = "direction")
  override fun setDirection(view: GleamView, direction: String?) {
    view.direction = when (direction) {
      "rtl" -> GleamView.Direction.RTL
      "ttb" -> GleamView.Direction.TTB
      else -> GleamView.Direction.LTR
    }
  }

  @ReactProp(name = "baseColor", customType = "Color")
  override fun setBaseColor(view: GleamView, baseColor: Int?) {
    view.baseColor = baseColor ?: 0xFFE0E0E0.toInt()
  }

  @ReactProp(name = "highlightColor", customType = "Color")
  override fun setHighlightColor(view: GleamView, highlightColor: Int?) {
    view.highlightColor = highlightColor ?: 0xFFF5F5F5.toInt()
  }

  override fun setBorderRadius(view: GleamView, borderRadius: Float) {
    view.cornerRadius = borderRadius
    super.setBorderRadius(view, borderRadius)
  }

  override fun onDropViewInstance(view: GleamView) {
    view.cleanup()
    super.onDropViewInstance(view)
  }

  override fun needsCustomLayoutForChildren(): Boolean = false

  companion object {
    const val NAME = "GleamView"
  }
}
