let inputStack = []
let overrided = false

let itemImpactCoord = null

let propertiesList = []
class Property {
  constructor (defaultValue) {
    this.defaultValue = Array.isArray(defaultValue)
      ? defaultValue.slice()
      : defaultValue
    this._val = Array.isArray(this.defaultValue)
      ? this.defaultValue.slice()
      : this.defaultValue
    this._new = Array.isArray(this.defaultValue)
      ? this.defaultValue.slice()
      : this.defaultValue

    propertiesList.push(this)
  }

  set val (val) {
    this._new = val
    this._val = val
  }

  get val () {
    return this._val
  }

  push (val) {
    this._new.push(val)
  }

  update () {
    this._val = Array.isArray(this._new)
      ? this._new.slice()
      : this._new
    this._new = Array.isArray(this.defaultValue)
      ? this.defaultValue.slice()
      : this.defaultValue
  }
}

let itemImpact = new Property([])
let createItemVisible = new Property(false)

window.addEventListener('message', e => {
  if (e.data.message == 'get_item_impact') {
    clickOn('items')
    clickOn('create_custom')
    paste(e.data.text)
    moveTo('Create')
    inputStack.push(['skip'])
    inputStack.push(['set_item_impact', e.data.dataId])
    clickOn('Cancel')
  } else if (e.data.message == 'import_build') {
    console.log('import doesnt work');
    //console.log(e.data.code);
    /*clickOn('import/export')
    clickOn('import_code')
    paste('test')*/
    //paste(e.data.code)
    //clickOn('import')
  }
}, false)

function override () {
  let cloneDraw = Object.assign({}, draw)

  draw.StartFrame = function () {
    cloneDraw.StartFrame.call(draw)
  }

  draw.EndFrame = function () {
    for (let p of propertiesList) {
      p.update()
    }
    if (inputStack.length > 0) {
      triggerInput(inputStack.shift())
    }
    cloneDraw.EndFrame.call(draw)
  }

  draw.p_DrawString = function p_DrawString (x, y, align, size, font, text) {
    if (['Create', 'Cancel'].includes(text)) {
      coordsOf[text] = [x, y]
    } else if (text.startsWith('^7Equipping this item')) {
      itemImpactCoord = {x: x, y: y}
      itemImpact.push(text)
    } else if (itemImpactCoord != null && x == itemImpactCoord.x && y > itemImpactCoord.y) {
      itemImpact.push(text)
    } else if (text == 'Create Custom Item from Text') {
      createItemVisible.val = true
    }

    //console.log(text)
    //console.log(`${text} (${x}, ${y})`)

    cloneDraw.p_DrawString.call(draw, x, y, align, size, font, text)
  }

  /*let clone__fillMouseEventData = __fillMouseEventData.bind({})
  __fillMouseEventData = function (eventStruct, e, target) {
    console.log((i++) + " __fillMouseEventData " + eventStruct + " " + e.type)
    console.log(e)
    console.log(target)
    clone__fillMouseEventData(eventStruct, e, target)
  }

  let clone__registerKeyEventCallback = __registerKeyEventCallback.bind({})
  __registerKeyEventCallback = function (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    console.log((i++) + " __registerKeyEventCallback -----------------------------------------------")
    console.log(target)
    console.log(userData);
    console.log(eventTypeId);
    console.log(eventTypeString);
    clone__registerKeyEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread)
  }

  _inject_paste = Module["_inject_paste"] = function () {
    console.log('_inject_paste')
    console.log(arguments)
   return Module["asm"]["Ga"].apply(null, arguments);
 }*/
}

override()

let coordsOf = {
  'skills': [115, 70],
  'items': [188, 70],
  'create_custom': [1308, 76],
  'import/export': [69, 44],
  'import_code': [379, 179],
  'import': [349, 235],
  'middle': [() => window.innerWidth/2, () => window.innerHeight/2]
}

window.body.addEventListener('paste', e => {
  console.log(e.clipboardData.getData('text'));
  console.log(e);
})

function triggerInput (input) {
  if (input[0] == 'skip') {
    return
  } else if (input[0].startsWith('mouse')) { // Mouse Events
    let coords = coordsOf[input[1]]
    if (typeof coords[0] == 'function') coords[0] = coords[0]()
    if (typeof coords[1] == 'function') coords[1] = coords[1]()
    glCanvas.dispatchEvent(createMouseEvent(input[0], coords[0], coords[1]))
  } else if (input[0] == 'paste') { // Paste
    /*let dt = new DataTransfer()
    dt.setData('text/plain', input[1])
    let e = new ClipboardEvent('paste', {
      clipboardData: dt,
      dataType: 'text/plain',
      data: input[1],
      bubbles: true,
      cancelable: true,
      composed: true
    })
    window.body.dispatchEvent(e)*/
    Module["asm"]["Ga"].apply(null, [allocate(intArrayFromString(input[1]), "i8", ALLOC_NORMAL)])
  } else if (input[0] == 'set_item_impact') {
    window.top.postMessage({
      message: 'set_item_impact',
      itemImpact: itemImpact.val,
      dataId: input[1]
    }, '*')
  } else {
    throw new Error('Unknown event type: ' + input[0])
  }
}

function createMouseEvent (type, x, y) {
  return new MouseEvent(type, {
    button: 0,
    target: glCanvas,
    clientX: x,
    clientY: y
  })
}

function clickOn (name) {
  inputStack.push(['mousedown', name])
  inputStack.push(['mouseup', name])
}

function moveTo (name) {
  inputStack.push(['mousemove', name])
}

function paste (value) {
  inputStack.push(['paste', value])
}
