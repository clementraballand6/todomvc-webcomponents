(function (window) {
	'use strict';

	function getTemplate(id) {
		return document.getElementById(id).content.cloneNode(true);
	}

	class TodoList extends HTMLElement {
		constructor() {
			super();
			this.appendChild(getTemplate('todolist'));
			this.$main = this.querySelector('.main');
			this.$tasks = this.querySelector('.todo-list');
			this.$footer = this.querySelector('.footer');
			this.$filters = this.querySelector('.filters');
			this.$count = this.querySelector('.todo-count > strong');

			this.querySelector('input.new-todo').addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					this.addTodo(event.target.value);
					event.target.value = '';
				}
			});

			this.querySelector('.clear-completed').addEventListener("click", () => {
				[...this.$tasks.children].forEach(($li) => {
					if ($li.$props.done) $li.remove();
				});
			});

			this.querySelector('label[for="toggle-all"]').addEventListener("click", () => {
				const selectAll = !this.querySelector('#toggle-all').checked;
				[...this.$tasks.children].forEach(($li) => {
					$li.$props.done = selectAll;
					$li.classList[selectAll ? 'add' : 'remove']('completed');
					$li.querySelector('.toggle').checked = selectAll;
				});
				this.updateListCount();
			});

			window.addEventListener('hashchange', (e) => {
				this.applyFilter(location.hash.replace('#', ''));
				[...this.$filters.querySelectorAll('a[href^="#"]')].forEach(($el) => $el.classList.remove('selected'));
				this.$filters.querySelector('a[href="' + location.hash + '"]').classList.add('selected');
			});
		}

		addTodo(value) {
			if (!value) return;

			const $task = getTemplate('todolist-element');
			$task.querySelector('label').innerHTML = value;

			this.$tasks.appendChild($task);

			const addedNode = this.$tasks.lastElementChild;
			const $editInput = addedNode.querySelector('input.edit');
			addedNode.$props = {};
			addedNode.$props.value = value;
			addedNode.$props.done = false;
			$editInput.value = value;

			addedNode.querySelector('.destroy').addEventListener('click', () => {
				addedNode.remove();
				if (this.$tasks.children.length) {
					this.updateListCount();
				} else {
					this.$main.style.display = 'none';
					this.$footer.style.display = 'none';
				}
			});

			addedNode.querySelector('label').addEventListener('dblclick', () => {
				addedNode.classList.add('editing');
				$editInput.select();
				$editInput.setSelectionRange(-1, -1);
				$editInput.addEventListener('focusout', function () {
					addedNode.classList.remove('editing');
					addedNode.querySelector('label').innerHTML = $editInput.value;
					addedNode.$props.value = $editInput.innerHTML;
					$editInput.removeEventListener('focusout', this, true);
				});
			});

			addedNode.querySelector('.toggle').addEventListener('click', (event) => {
				if (event.target.checked) {
					addedNode.classList.add('completed');
				} else {
					addedNode.classList.remove('completed');
				}
				addedNode.$props.done = event.target.checked;
				this.updateListCount();
			});

			this.updateListCount();

			this.$main.style.display = 'block';
			this.$footer.style.display = 'block';
		}

		updateListCount() {
			this.$count.innerHTML = [...this.$tasks.children].reduce((acc, $li) => {
				if (!$li.$props.done) acc++;
				return acc;
			}, 0);
		}

		applyFilter(route) {
			const routes = {
				"/": ($li) => {
					$li.style.display = 'block';
				},
				"/completed": ($li) => {
					$li.style.display = $li.$props.done ? 'block' : 'none';
				},
				"/active": ($li) => {
					$li.style.display = $li.$props.done ? 'none' : 'block';
				}
			};

			[...this.$tasks.children].forEach(($li) => {
				routes[route]($li);
			});
		}
	}

	customElements.define('todo-list', TodoList);
})(window);
