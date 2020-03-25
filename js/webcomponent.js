function getAttributeStartingBy(element, str) {
	var el = element.querySelectorAll("*"), res=[];

	for (var i = 0, n=el.length; i < n; i++){
		for (var j=0;j<el[i].attributes.length;j++) {
			if (el[i].attributes[j].name.indexOf(str)==0) {
				res.push({
					element: el[i],
					attribute: el[i].attributes[j]
				});
			}
		}
	}
	return res;
}

class WebComponent extends HTMLElement {
	constructor() {
		super();
		this.events = [];
		this.appendChild(this.html(this.template()));
	}

	bindEvents(scope) {
		getAttributeStartingBy(scope || this, "@").forEach((target) => {
			target.element.addEventListener(target.attribute.name.replace('@', ''), (e) => {
				this[target.attribute.value](e);
				this.events.push({
					target: target,
					listener: this[target.attribute.value]
				});
			});
		});
	}

	removeEvents() {
		this.events.forEach((ev) => {
			ev.target.removeEventListener(ev.target.attribute.name, ev.listener);
		});
	}

	html(html) {
		const div = document.createElement('div');
		div.innerHTML = html.trim();

		this.bindEvents(div.firstChild);

		return div.firstChild;
	}
}
