import { Color, GridLayout, Image, ImageSource, Label, Property, isIOS } from '@nativescript/core'
import { motionScope, reducedMotion, set, type Animation, type MotionScope } from '@rafaelaugusto/jolt'

const spectrum = ['#b864ef', '#cc86d3', '#fff18a', '#caef99', '#54c5dc', '#168aff']

/** The readable label stays native. A separate masked light band supplies the sheen. */
class SpectrumLabel extends Label {
  private paintSize = ''

  override onLayout(left: number, top: number, right: number, bottom: number) {
    super.onLayout(left, top, right, bottom)
    const { width, height } = this.getActualSize()
    const key = `${width}:${height}:${this.text}:${this.fontSize}`
    if (width <= 0 || height <= 0 || this.paintSize === key) return
    this.paintSize = key

    if (isIOS) {
      UIGraphicsBeginImageContextWithOptions(CGSizeMake(width, height), false, 0)
      const context = UIGraphicsGetCurrentContext()
      if (context) {
        const gradient = CGGradientCreateWithColors(
          CGColorSpaceCreateDeviceRGB(),
          spectrum.map(color => new Color(color).ios.CGColor) as any,
          null,
        )
        CGContextDrawLinearGradient(context, gradient, CGPointMake(0, 0), CGPointMake(width, 0), CGGradientDrawingOptions.kCGGradientDrawsBeforeStartLocation)
        const image = UIGraphicsGetImageFromCurrentImageContext()
        if (image) (this.nativeViewProtected as UILabel).textColor = UIColor.colorWithPatternImage(image)
      }
      UIGraphicsEndImageContext()
    } else {
      const label = this.nativeViewProtected as android.widget.TextView
      const colors = Array.create('int', spectrum.length)
      spectrum.forEach((color, index) => { colors[index] = new Color(color).android })
      label.getPaint().setShader(new android.graphics.LinearGradient(
        0, 0, label.getWidth(), 0, colors, null, android.graphics.Shader.TileMode.CLAMP,
      ))
      label.invalidate()
    }
  }

  override disposeNativeView() {
    this.paintSize = ''
    super.disposeNativeView()
  }
}

export class GradientTitle extends GridLayout {
  declare text: string
  private readonly label = new SpectrumLabel()
  private readonly light = new GridLayout()
  private readonly band = new GridLayout()
  private readonly paint = new GridLayout()
  private readonly androidMask = isIOS ? undefined : new Image()
  private motion?: MotionScope
  private sweep?: Animation
  private maskKey = ''
  private maskImage?: UIImage | android.graphics.Bitmap

  constructor() {
    super()
    this.label.textAlignment = 'center'
    this.label.padding = 0
    this.light.isUserInteractionEnabled = false
    this.light.accessibilityHidden = true
    this.light.opacity = 0
    this.band.horizontalAlignment = 'left'
    this.band.addChild(this.paint)
    this.light.addChild(this.band)
    if (this.androidMask) {
      this.androidMask.stretch = 'fill'
      this.light.addChild(this.androidMask)
    }
    this.addChild(this.label)
    this.addChild(this.light)
  }

  get fontSize() { return this.style.fontSize as number }
  set fontSize(size: number) { this.style.fontSize = size }

  updateText(text: string) {
    this.sweep?.stop()
    this.light.opacity = 0
    this.label.text = text
    this.maskKey = ''
    this.requestLayout()
  }

  override onLayout(left: number, top: number, right: number, bottom: number) {
    super.onLayout(left, top, right, bottom)
    const { width, height } = this.getActualSize()
    if (!width || !height) return
    const key = `${width}:${height}:${this.text}:${this.label.fontSize}`
    if (key === this.maskKey) return
    this.maskKey = key
    this.band.width = Math.max(80, width * .34)
    this.makeMask()
  }

  /** One pass for each entrance; Jolt moves the light entirely on the native clock. */
  playSheen(delay = 0) {
    this.sweep?.stop()
    if (!this.isLoaded || reducedMotion()) { this.light.opacity = 0; return }
    if (!this.motion) {
      this.motion = motionScope()
      this.motion.gradient(this.paint, { type: 'linear', angle: 90,
        colors: ['#ffffff00', '#ffffffb8', '#ffffffff', '#ffffffb8', '#ffffff00'],
        stops: [0, .3, .5, .7, 1] })
    }
    const width = this.getActualSize().width
    const bandWidth = Math.max(80, width * .34)
    set(this.band, { x: -bandWidth })
    set(this.light, { opacity: 1 })
    this.sweep = this.motion.animate(this.band, { x: [-bandWidth, width] }, {
      duration: 1050, delay, ease: 'easeInOut',
    })
  }

  private makeMask() {
    if (isIOS) {
      const native = this.label.ios as UILabel
      const previousColor = native.textColor
      native.textColor = UIColor.whiteColor
      UIGraphicsBeginImageContextWithOptions(native.bounds.size, false, 0)
      native.drawTextInRect(native.bounds)
      const image = UIGraphicsGetImageFromCurrentImageContext()
      UIGraphicsEndImageContext()
      native.textColor = previousColor
      if (!image) return
      this.maskImage = image
      const mask = UIImageView.alloc().initWithImage(image)
      mask.frame = (this.light.ios as UIView).bounds
      ;(this.light.ios as UIView).maskView = mask
    } else {
      const native = this.label.android as android.widget.TextView
      const bitmap = android.graphics.Bitmap.createBitmap(native.getWidth(), native.getHeight(), android.graphics.Bitmap.Config.ARGB_8888)
      const color = native.getCurrentTextColor()
      const shader = native.getPaint().getShader()
      native.setTextColor(android.graphics.Color.WHITE)
      native.getPaint().setShader(null as any)
      native.draw(new android.graphics.Canvas(bitmap))
      native.setTextColor(color)
      native.getPaint().setShader(shader)
      this.maskImage = bitmap
      this.androidMask!.imageSource = new ImageSource(bitmap)
      const maskPaint = new android.graphics.Paint()
      maskPaint.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.DST_IN))
      ;(this.light.android as android.view.View).setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)
      ;(this.androidMask!.android as android.view.View).setLayerType(android.view.View.LAYER_TYPE_HARDWARE, maskPaint)
    }
  }

  override disposeNativeView() {
    this.motion?.dispose()
    this.motion = undefined
    this.sweep = undefined
    this.maskImage = undefined
    this.maskKey = ''
    if (isIOS && this.light.ios) (this.light.ios as UIView).maskView = null
    super.disposeNativeView()
  }
}

new Property<GradientTitle, string>({
  name: 'text', defaultValue: '', valueChanged: (view, _old, text) => view.updateText(text),
}).register(GradientTitle)
