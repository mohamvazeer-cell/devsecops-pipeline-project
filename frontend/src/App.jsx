import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8080'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadTasks = () => {
    setLoading(true)

    fetch(`${API_BASE}/tasks.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data)
          setError('')
        } else {
          setTasks([])
          setError('Backend did not return a task array')
        }
      })
      .catch(() => {
        setError('Could not connect to backend')
        setTasks([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  )

  const pendingCount = tasks.length - completedCount

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (filter === 'pending') {
      result = result.filter((task) => !task.completed)
    } else if (filter === 'completed') {
      result = result.filter((task) => task.completed)
    }

    if (searchTerm.trim()) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return result
  }, [tasks, filter, searchTerm])

  const addTask = () => {
    if (!title.trim()) return

    fetch(`${API_BASE}/tasks.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle('')
        setError('')
        loadTasks()
      })
      .catch(() => {
        setError('Failed to add task')
      })
  }

  const toggleTask = (task) => {
    fetch(`${API_BASE}/tasks.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: task.id,
        completed: !task.completed,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setError('')
        loadTasks()
      })
      .catch(() => {
        setError('Failed to update task')
      })
  }

  const deleteTask = (id) => {
    fetch(`${API_BASE}/tasks.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then(() => {
        setError('')
        loadTasks()
      })
      .catch(() => {
        setError('Failed to delete task')
      })
  }

  return (
    <div className="app-shell">
      <main className="task-app">
        <div className="hero">
          <div>
            <p className="eyebrow">Productivity app</p>
            <h1>Task Manager</h1>
            <p className="subtitle">
              Organize your work with a clean and simple task dashboard.
            </p>
          </div>

          <div className="stats">
            <div className="stat-card">
              <span className="stat-label">Total</span>
              <strong>{tasks.length}</strong>
            </div>

            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <strong>{completedCount}</strong>
            </div>

            <div className="stat-card">
              <span className="stat-label">Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="task-form">
            <input
              type="text"
              placeholder="Enter a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTask()
              }}
            />
            <button onClick={addTask}>Add Task</button>
          </div>

          <div className="toolbar">
            <div className="filters">
              <button
                className={filter === 'all' ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setFilter('all')}
              >
                All <span>{tasks.length}</span>
              </button>

              <button
                className={filter === 'pending' ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setFilter('pending')}
              >
                Pending <span>{pendingCount}</span>
              </button>

              <button
                className={filter === 'completed' ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setFilter('completed')}
              >
                Completed <span>{completedCount}</span>
              </button>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="message error">{error}</p>}
          {loading && <p className="message">Loading tasks...</p>}

          {!loading && (
            <p className="result-count">
              Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
          )}

          {!loading && filteredTasks.length === 0 && !error && (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>
                {searchTerm.trim()
                  ? `No tasks match "${searchTerm}".`
                  : filter === 'all'
                  ? 'Add your first task to get started.'
                  : `There are no ${filter} tasks right now.`}
              </p>
            </div>
          )}

          {!loading && filteredTasks.length > 0 && (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-card ${task.completed ? 'completed' : ''}`}
                >
                  <button
                    className="task-check"
                    onClick={() => toggleTask(task)}
                    aria-label={
                      task.completed
                        ? 'Mark task as incomplete'
                        : 'Mark task as complete'
                    }
                  >
                    {task.completed ? '✓' : ''}
                  </button>

                  <div
                    className="task-content"
                    onClick={() => toggleTask(task)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleTask(task)
                      }
                    }}
                  >
                    <p className="task-title">{task.title}</p>
                    <span className="task-status">
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App