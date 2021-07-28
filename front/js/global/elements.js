const _basicDiv = (type,name) => {
	const d = document.createElement("div")
	d.classList = `Element-${type}-${name}`
	return d
}

class BaseElement {
	constructor(options, defaultValues) {
		this.options = Object.assign({}, defaultValues, options)
	}
}

// Modal element that gets put in the middle of the screen prompting direct action or dismissal
class Modal extends BaseElement {
	/**
	 * 
	 * @param {Object} options 
	 * @param {Element} parent 
	 * @param {String} titleText
	 */
	constructor(titleText = "modal", options, parent) {
		super(options,{
			// Extra classes to add, not including the default "Element-Modal"
			classList: "",
			// if clicking outside the modal dismisses it
			clickOutsideDismiss: true,
			// if element can be dismissed with dismiss button. If this is set to false "clickOutsideDismiss" value will ignored
			dismissable: true
	
		})
		if(parent) this.parent = parent
		else {
			this.parent = document.createElement("div")
			this.parent.classList = "Element-Modal-Parent"
		}

		// Handle click event of parent
		const handleClick = (ev) => {
			// check if target (element directly clicked) is parent element and also check if both dismissable and clickOutsideDismiss is true
			// in which case the modal will be dismissed
			if(ev.target == this.parent && this.options.clickOutsideDismiss && this.options.dismissable) this.dismiss()
		}
		// assign "handleClick" function as handler for click event of parent element
		this.parent.onclick = handleClick


		this.element = document.createElement("div")
		this.element.classList = "Element-Modal " + this.options.classList

		this.header = _basicDiv("Modal","Header")
		const title = document.createElement("h2")
		title.innerHTML = titleText
		this.header.append(title)

		if(this.options.dismissable) {
			const dismissbtn = document.createElement("button")
			dismissbtn.innerHTML = `<h2>X</h2>`
	
			this.dismiss = this.dismiss.bind(this)
			dismissbtn.onclick = this.dismiss
			this.header.append(dismissbtn)
		}

		this.body = _basicDiv("Modal","Body")
		this.footer = _basicDiv("Modal","Footer")
		
		this.element.append(this.header,this.body,this.footer)

		this.parent.appendChild(this.element)

		// grab all elements in body and put them in div with blur class
		// alternative could be using background-filter but that is not universally supported at time of writing
		this._container = document.createElement("div")
		this._container.classList = "Element-Effect-Blur"
		while(document.body.childNodes.length > 0) 
			this._container.appendChild(document.body.childNodes[0])

		document.body.append(this._container, this.parent)
	}

	dismiss() {
		while(this._container.childNodes.length > 0) 
			document.body.appendChild(this._container.childNodes[0])
		this._container.remove()

		this.element.classList += "Element-Modal-Outbound"
		setTimeout(() => { this.parent.remove() }, 250)
	}
}