function getAttributeStartingBy(element, needles) {
	var el = element.querySelectorAll("*"), res=[];

	for (var i = 0, n=el.length; i < n; i++){
		for (var j=0;j<el[i].attributes.length;j++) {
			needles.forEach((n) => {
				if (el[i].attributes[j].name.indexOf(n)==0) {
					res.push({
						element: el[i],
						attribute: {
							name: el[i].attributes[j].name.replace(n, ''),
							value: el[i].attributes[j].value
						},
						needle: n
					});
				}
			});
		}
	}
	return res;
}

function _get(o, path, defvalue) {
	var parts = path.split('.');
	var res = parts.reduce(function (p, part) {
		return part.indexOf('()') > -1 ? (p || {})[part.replace('()', '')]() : (p || {})[part];
	}, o);
	return res === undefined ? defvalue : res;
}

const actionsHandler = {
	"show": (target, value) => {
		if (target.attribute.value.indexOf('!') === 0) value = !value;
		target.element.style.display = value ? 'block' : 'none';
	},
	"bind": (target, value) => {
		target.element.innerHTML = value;
	}
};

class WebComponent extends HTMLElement {
	constructor() {
		super();
		this.bindings = {
			events: [],
			data: []
		};
		this.appendChild(this.html(this.template(), false));
	}

	connectedCallback() {
		this.$updateView();
	}

	$updateViewForBinding(binding) {
		actionsHandler[binding.target.attribute.name](binding.target, _get(this, binding.target.attribute.value.replace('!', ''), false));
	}

	$updateView() {
		this.bindings.data.forEach((binding) => {
			this.contains(binding.target.element) && this.$updateViewForBinding(binding);
		});
	}

	$setBindings(scope) {
		const attributes = {
			// Events bindings
			"@": (target) => {
				target.element.addEventListener(target.attribute.name, (e) => {
					const triggerChange = this[target.attribute.value](e);
					triggerChange !== false && this.$updateView();
				});

				this.bindings.events.push({
					target: target,
					listener: this[target.attribute.value]
				});
			},
			// Others data related bindings
			":": (target) => {
				if (!target.attribute.value) return;
				this.bindings.data.push({
					target: target
				});
			}
		};

		getAttributeStartingBy(scope || this, ["@", ":"]).forEach((target) => {
			attributes[target.needle](target);
		});
	}

	removeEvents() {
		this.events.forEach((ev) => {
			ev.target.removeEventListener(ev.target.attribute.name, ev.listener);
		});
	}

	html(html, update = true) {
		const div = document.createElement('div');
		div.innerHTML = html.trim();

		this.$setBindings(div.firstChild);
		update && this.$updateView();

		return div.firstChild;
	}
}
