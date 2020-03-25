class TodoList extends WebComponent {
	template() {
		return `
		<section class="todoapp">
			<header class="header">
				<h1>todos</h1>
				<input @keydown="addTodo" class="new-todo" placeholder="What needs to be done?" autofocus>
			</header>
			<section :show="_$tasks.children.length" class="main">
				<input id="toggle-all" class="toggle-all" type="checkbox">
				<label for="toggle-all" @click="selectAll">Mark all as complete</label>
				<ul class="todo-list"></ul>
			</section>
			<footer :show="_$tasks.children.length" class="footer">
				<span class="todo-count"><strong :bind="getCount()"></strong> item left</span>
				<ul class="filters">
					<li>
						<a @click="applyFilter" filter="all" class="selected">All</a>
					</li>
					<li>
						<a @click="applyFilter" filter="active">Active</a>
					</li>
					<li>
						<a @click="applyFilter" filter="completed">Completed</a>
					</li>
				</ul>
				<button @click="removeAll" class="clear-completed">Clear completed</button>
			</footer>
		</section>
		`;
	}

	constructor() {
		super();

		this._$tasks = this.querySelector('.todo-list');
		this._$filters = this.querySelector('.filters');
	}

	selectAll() {
		const selectAll = !this.querySelector('#toggle-all').checked;
		[...this._$tasks.children].forEach(($li) => {
			$li.$props.done = selectAll;
			$li.classList[selectAll ? 'add' : 'remove']('completed');
			$li.querySelector('.toggle').checked = selectAll;
		});
	}

	removeAll() {
		[...this._$tasks.children].forEach(($li) => {
			if ($li.$props.done) $li.remove();
		});
	}

	removeTodo(event) {
		const $li = event.target.closest('li');
		$li.remove();
	}

	toggleTodo(event) {
		const $li = event.target.closest('li');
		if (event.target.checked) {
			$li.classList.add('completed');
		} else {
			$li.classList.remove('completed');
		}
		$li.$props.done = event.target.checked;
	}

	addTodo(event) {
		const value = event.target.value;
		if (event.key !== "Enter" || !value) return false;
		event.target.value = '';
		event.preventDefault();

		const $task = this.html(`
			<li>
				<div class="view">
					<input @click="toggleTodo" class="toggle" type="checkbox">
					<label></label>
					<button @click="removeTodo" class="destroy"></button>
				</div>
				<input class="edit">
			</li>
		`);

		$task.querySelector('label').innerHTML = value;

		this._$tasks.appendChild($task);

		const $editInput = $task.querySelector('input.edit');
		$task.$props = {};
		$task.$props.value = value;
		$task.$props.done = false;
		$editInput.value = value;

		$task.querySelector('label').addEventListener('dblclick', () => {
			$task.classList.add('editing');
			$editInput.select();
			$editInput.setSelectionRange(-1, -1);
			$editInput.addEventListener('focusout', function () {
				$task.classList.remove('editing');
				$task.querySelector('label').innerHTML = $editInput.value;
				$task.$props.value = $editInput.innerHTML;
				$editInput.removeEventListener('focusout', this, true);
			});
		});
	}

	getCount() {
		return [...this._$tasks.children].reduce((acc, $li) => {
			if (!$li.$props.done) acc++;
			return acc;
		}, 0);
	}

	applyFilter(event) {
		const filters = {
			"all": ($li) => {
				$li.style.display = 'block';
			},
			"completed": ($li) => {
				$li.style.display = $li.$props.done ? 'block' : 'none';
			},
			"active": ($li) => {
				$li.style.display = $li.$props.done ? 'none' : 'block';
			}
		};

		[...this._$tasks.children].forEach(($li) => {
			filters[event.target.getAttribute('filter')]($li);
		});

		[...event.target.closest('ul').querySelectorAll('a')].forEach(($el) => $el.classList.remove('selected'));
		event.target.classList.add('selected');
	}
}

customElements.define('todo-list', TodoList);
