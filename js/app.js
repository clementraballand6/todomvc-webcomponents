class TodoList extends WebComponent {
	template() {
		return `
		<section class="todoapp">
			<header class="header">
				<h1>todos</h1>
				<input @keydown="addTodo" class="new-todo" placeholder="What needs to be done?" autofocus>
			</header>
			<section class="main" style="display: none;">
				<input id="toggle-all" class="toggle-all" type="checkbox">
				<label for="toggle-all" @click="selectAll">Mark all as complete</label>
				<ul class="todo-list"></ul>
			</section>
			<footer class="footer" style="display: none;">
				<span class="todo-count"><strong>0</strong> item left</span>
				<ul class="filters">
					<li>
						<a class="selected" href="#/">All</a>
					</li>
					<li>
						<a href="#/active">Active</a>
					</li>
					<li>
						<a href="#/completed">Completed</a>
					</li>
				</ul>
				<button @click="removeAll" class="clear-completed">Clear completed</button>
			</footer>
		</section>
		`;
	}

	constructor() {
		super();

		this.$main = this.querySelector('.main');
		this.$tasks = this.querySelector('.todo-list');
		this.$footer = this.querySelector('.footer');
		this.$filters = this.querySelector('.filters');
		this.$count = this.querySelector('.todo-count > strong');

		window.addEventListener('hashchange', (e) => {
			this.applyFilter(location.hash.replace('#', ''));
			[...this.$filters.querySelectorAll('a[href^="#"]')].forEach(($el) => $el.classList.remove('selected'));
			this.$filters.querySelector('a[href="' + location.hash + '"]').classList.add('selected');
		});
	}

	selectAll() {
		const selectAll = !this.querySelector('#toggle-all').checked;
		[...this.$tasks.children].forEach(($li) => {
			$li.$props.done = selectAll;
			$li.classList[selectAll ? 'add' : 'remove']('completed');
			$li.querySelector('.toggle').checked = selectAll;
		});
		this.updateListCount();
	}

	removeAll() {
		[...this.$tasks.children].forEach(($li) => {
			if ($li.$props.done) $li.remove();
		});
	}

	removeTodo(event) {
		const $li = event.target.closest('li');
		$li.remove();
		if (this.$tasks.children.length) {
			this.updateListCount();
		} else {
			this.$main.style.display = 'none';
			this.$footer.style.display = 'none';
		}
	}

	toggleTodo(event) {
		const $li = event.target.closest('li');
		if (event.target.checked) {
			$li.classList.add('completed');
		} else {
			$li.classList.remove('completed');
		}
		$li.$props.done = event.target.checked;
		this.updateListCount();
	}

	addTodo(event) {
		if (event.key !== "Enter") return;
		const value = event.target.value;
		event.target.value = '';
		if (!value) return;
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

		this.$tasks.appendChild($task);

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
