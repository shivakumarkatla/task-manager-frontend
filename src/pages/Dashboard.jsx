import { useEffect, useMemo, useState } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/tasks';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  console.log('DASHBOARD USER:', user);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });

  // -------------------------
  // FORM CHANGE
  // -------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -------------------------
  // CREATE TASK
  // -------------------------

  const handleCreateTask = async (event) => {
    event.preventDefault();

    try {
      setError('');

      const response = await createTask(formData);

      setTasks((previous) => [
        ...previous,
        response.data,
      ]);

      setFormData({
        title: '',
        description: '',
        status: 'pending',
      });

      setShowForm(false);
      setActiveFilter('all');
    } catch (error) {
      console.error('Failed to create task:', error);

      setError(
        error.response?.data?.message ||
          'Failed to create task'
      );
    }
  };

  // -------------------------
  // START EDIT
  // -------------------------

  const handleEditStart = (task) => {
    setEditingTaskId(task._id);

    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
    });

    setError('');
  };

  // -------------------------
  // CANCEL EDIT
  // -------------------------

  const handleEditCancel = () => {
    setEditingTaskId(null);

    setFormData({
      title: '',
      description: '',
      status: 'pending',
    });

    setError('');
  };

  // -------------------------
  // SAVE EDIT
  // -------------------------

  const handleEditSave = async (event) => {
    event.preventDefault();

    try {
      setError('');

      const response = await updateTask(
        editingTaskId,
        formData
      );

      setTasks((previous) =>
        previous.map((task) =>
          task._id === editingTaskId
            ? response.data
            : task
        )
      );

      setEditingTaskId(null);

      setFormData({
        title: '',
        description: '',
        status: 'pending',
      });
    } catch (error) {
      console.error('Failed to update task:', error);

      setError(
        error.response?.data?.message ||
          'Failed to update task'
      );
    }
  };

  // -------------------------
  // STATUS UPDATE
  // -------------------------

  const handleStatusChange = async (taskId, status) => {
    try {
      setError('');

      const response = await updateTask(taskId, {
        status,
      });

      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId
            ? response.data
            : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);

      setError(
        error.response?.data?.message ||
          'Failed to update task'
      );
    }
  };

  // -------------------------
  // DELETE TASK
  // -------------------------

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await deleteTask(taskId);

      setTasks((previous) =>
        previous.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      console.error('Failed to delete task:', error);

      setError(
        error.response?.data?.message ||
          'Failed to delete task'
      );
    }
  };

  // -------------------------
  // STATUS BADGE
  // -------------------------

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };

    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          styles[status] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  // -------------------------
  // LOAD TASKS
  // -------------------------

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setError('');

        const response = await getTasks();

        setTasks(response.data || []);
      } catch (error) {
        console.error('Failed to load tasks:', error);

        setError(
          error.response?.data?.message ||
            'Failed to load tasks'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // -------------------------
  // FILTER TASKS
  // -------------------------

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') {
      return tasks;
    }

    return tasks.filter(
      (task) => task.status === activeFilter
    );
  }, [tasks, activeFilter]);

  // -------------------------
  // FILTER COUNTS
  // -------------------------

  const filterCounts = {
    all: tasks.length,
    pending: tasks.filter(
      (task) => task.status === 'pending'
    ).length,
    'in-progress': tasks.filter(
      (task) => task.status === 'in-progress'
    ).length,
    completed: tasks.filter(
      (task) => task.status === 'completed'
    ).length,
  };

  const filters = [
    {
      value: 'all',
      label: 'All',
    },
    {
      value: 'pending',
      label: 'Pending',
    },
    {
      value: 'in-progress',
      label: 'In Progress',
    },
    {
      value: 'completed',
      label: 'Completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900">
            Task Manager
          </h1>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {user?.name}
            </span>

            <button
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PAGE HEADER */}

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome, {user?.name} 👋
          </h2>

          <p className="mt-2 text-gray-600">
            Manage your tasks from one place.
          </p>
        </div>

        {/* CREATE BUTTON */}

        <div className="mt-6">
          <button
            onClick={() =>
              setShowForm((previous) => !previous)
            }
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            {showForm ? 'Cancel' : '+ Create Task'}
          </button>
        </div>

        {/* CREATE FORM */}

        {showForm && (
          <form
            onSubmit={handleCreateTask}
            className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Create Task
            </h3>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="create-title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Title
                </label>

                <input
                  id="create-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter task title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="create-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="create-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the task"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="create-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="create-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="in-progress">
                    In Progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
              >
                Create Task
              </button>
            </div>
          </form>
        )}

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* TASK SECTION */}

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Your Tasks
            </h3>

            {!loading && tasks.length > 0 && (
              <span className="text-sm text-gray-500">
                {filteredTasks.length}{' '}
                {filteredTasks.length === 1
                  ? 'task'
                  : 'tasks'}{' '}
                shown
              </span>
            )}
          </div>

          {/* FILTERS */}

          {!loading && tasks.length > 0 && (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => {
                const isActive =
                  activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter.value)
                    }
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {filter.label}

                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {filterCounts[filter.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">
                Loading tasks...
              </p>
            </div>
          )}

          {/* NO TASKS AT ALL */}

          {!loading &&
            !error &&
            tasks.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h4 className="font-semibold text-gray-900">
                  No tasks yet
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Create your first task to get started.
                </p>
              </div>
            )}

          {/* FILTER HAS NO RESULTS */}

          {!loading &&
            !error &&
            tasks.length > 0 &&
            filteredTasks.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h4 className="font-semibold text-gray-900">
                  No {activeFilter === 'in-progress'
                    ? 'in-progress'
                    : activeFilter}{' '}
                  tasks
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Try another filter or create a new
                  task.
                </p>
              </div>
            )}

          {/* TASK LIST */}

          {!loading &&
            !error &&
            filteredTasks.length > 0 && (
              <div className="mt-4 grid gap-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    {/* EDIT MODE */}

                    {editingTaskId === task._id ? (
                      <form onSubmit={handleEditSave}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Edit Task
                          </h4>

                          {getStatusBadge(
                            formData.status
                          )}
                        </div>

                        <div className="mt-5 space-y-4">
                          <div>
                            <label
                              htmlFor={`edit-title-${task._id}`}
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Title
                            </label>

                            <input
                              id={`edit-title-${task._id}`}
                              name="title"
                              type="text"
                              value={formData.title}
                              onChange={handleChange}
                              required
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-description-${task._id}`}
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>

                            <textarea
                              id={`edit-description-${task._id}`}
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              rows={4}
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-status-${task._id}`}
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Status
                            </label>

                            <select
                              id={`edit-status-${task._id}`}
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            >
                              <option value="pending">
                                Pending
                              </option>

                              <option value="in-progress">
                                In Progress
                              </option>

                              <option value="completed">
                                Completed
                              </option>
                            </select>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="submit"
                              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              onClick={handleEditCancel}
                              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {task.title}
                              </h4>

                              {getStatusBadge(
                                task.status
                              )}
                            </div>

                            {task.description && (
                              <p className="mt-2 text-sm leading-6 text-gray-600">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEditStart(task)
                              }
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteTask(
                                  task._id
                                )
                              }
                              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* STATUS */}

                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                          <label
                            htmlFor={`status-${task._id}`}
                            className="text-sm font-medium text-gray-600"
                          >
                            Change status
                          </label>

                          <select
                            id={`status-${task._id}`}
                            value={task.status}
                            onChange={(event) =>
                              handleStatusChange(
                                task._id,
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="in-progress">
                              In Progress
                            </option>

                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;