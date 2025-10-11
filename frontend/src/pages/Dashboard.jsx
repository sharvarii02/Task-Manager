
import { useState, useEffect, useMemo } from "react";
import API from "../Api";

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [tasks, setTasks] = useState([]);  
  const [loading, setLoading] = useState(false);
        
     const completedCount = tasks.filter(t => t.completed).length;
const pendingCount = tasks.length - completedCount;
const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  


  
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, task: 'Login Page Design', status: 'Done', time: '2 hours ago', icon: '🎨' },
    { id: 2, task: 'API Integration', status: 'Pending', time: '4 hours ago', icon: '🔌' },
    { id: 3, task: 'User Testing', status: 'Done', time: '1 day ago', icon: '🧪' },
    { id: 4, task: 'Bug Fixing', status: 'Pending', time: '2 days ago', icon: '🐛' }
  ]);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Medium',
    time: '',
    description: ''
  });
//dynamic
  const taskOverview = useMemo(() => {
  const total = tasks.length;
  const low = tasks.filter(t => t.priority === "Low").length;
  const medium = tasks.filter(t => t.priority === "Medium").length;
  const high = tasks.filter(t => t.priority === "High").length;

  return [
    { title: 'Total Tasks', value: total, color: 'bg-[#5A9690]', icon: '📊' },
    { title: 'Low Priority', value: low, color: 'bg-green-500', icon: '📉' },
    { title: 'Medium Priority', value: medium, color: 'bg-yellow-500', icon: '📝' },
    { title: 'High Priority', value: high, color: 'bg-[#D97D55]', icon: '🚨' }
  ];
}, [tasks]);

  const filterButtons = ['All', 'Today', 'Week', 'High', 'Medium', 'Low'];

  const navigationItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Pending Tasks', icon: '⏳' },
    { name: 'Completed Tasks', icon: '✅' },
    { name: 'Task List', icon: '📋' }
  ];

  const fetchTasks = async () => {
  try {
    setLoading(true);
    const res = await API.get("/tasks/gp");
    if (res.data.success) {
      setTasks(res.data.tasks);
    } else {
      console.log(res.data.message);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTasks();
}, []);

const handleAddTask = async (e) => {
  e.preventDefault();

  if (!newTask.title.trim()) return; // Prevent adding empty title

  try {
    // Send request to backend
    const res = await API.post("/tasks/gp", {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      time: newTask.time
    });

    if (res.data.success) {
      const createdTask = res.data.task;

      // Update task list
      setTasks((prev) => [createdTask, ...prev]);

      const newActivity = {
        id: Date.now(),
        task: `Created: ${createdTask.title}`,
        status: 'Pending',
        time: 'Just now',
        icon: '➕'
      };
      setRecentActivity((prev) => [newActivity, ...prev.slice(0, 3)]);

      // Reset form and close modal
      setNewTask({ title: '', priority: 'Medium', time: '', description: '' });
      setIsAddTaskModalOpen(false);
    } else {
      console.error("Failed to create task:", res.data.message);
    }
  } catch (err) {
    console.error("Error creating task:", err);
  }
};

    
    // Add to recent activity
    

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      priority: task.priority,
      time: task.time,
      description: task.description || ''
    });
    setIsEditTaskModalOpen(true);
  };

  
    const handleUpdateTask = async (e) => {
  e.preventDefault();
  if (!editingTask) return;

  try {
    const res = await API.put(`/tasks/${editingTask._id}/gp`, newTask);

    if (res.data.success) {
      const updatedTask = res.data.task;

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );

      // Add to recent activity
      const updateActivity = {
        id: Date.now(),
        task: `Updated: ${updatedTask.title}`,
        status: 'Pending',
        time: 'Just now',
        icon: '✏️'
      };
      setRecentActivity((prev) => [updateActivity, ...prev.slice(0, 3)]);

      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      setNewTask({ title: '', priority: 'Medium', time: '', description: '' });
    } else {
      console.error("Failed to update task:", res.data.message);
    }
  } catch (err) {
    console.error("Error updating task:", err);
  }
};

    

 const handleDeleteTask = async (taskId) => {
  try {
    const res = await API.delete(`/tasks/${taskId}/gp`);
    
    if (res.data.success) {
      const deletedTask = tasks.find((t) => t._id === taskId);

      // Update local tasks state
      setTasks((prev) => prev.filter((t) => t._id !== taskId));

      // Update recent activity
      const deleteActivity = {
        id: Date.now(),
        task: `Deleted: ${deletedTask.title}`,
        status: 'Done',
        time: 'Just now',
        icon: '🗑️'
      };
      setRecentActivity((prev) => [deleteActivity, ...prev.slice(0, 3)]);
    } else {
      console.error("Failed to delete task:", res.data.message);
    }
  } catch (err) {
    console.error("Error deleting task:", err);
  }
};


  const handleDeleteActivity = (activityId) => {
    setRecentActivity(recentActivity.filter(activity => activity.id !== activityId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks => prevTasks.map(task => {
  if (task._id === taskId) {
    const updatedTask = { ...task, completed: !task.completed };

    const completionActivity = {
      id: Date.now(),
      task: `${updatedTask.completed ? 'Completed' : 'Reopened'}: ${task.title}`,
      status: updatedTask.completed ? 'Done' : 'Pending',
      time: 'Just now',
      icon: updatedTask.completed ? '✅' : '🔄'
    };
    setRecentActivity(prev => [completionActivity, ...prev.slice(0, 3)]);

    return updatedTask;
  }
  return task;
}));

  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <div className="w-8 h-8 bg-[#5A9690] rounded-lg flex items-center justify-center mr-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#5A9690]">TaskFlow</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                  item.name === 'Dashboard' 
                    ? 'bg-[#5A9690] text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#5A9690] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-[#5A9690] hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-semibold text-gray-900">Good morning, John! 👋</h1>
                <p className="text-gray-600">Here's your task overview</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Add Task Button */}
              <button 
                onClick={() => setIsAddTaskModalOpen(true)}
                className="bg-[#D97D55] hover:bg-[#c86a45] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <span>➕</span>
                <span>Add Task</span>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-[#5A9690] rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-[#5A9690] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Task Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {taskOverview.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${card.color} bg-opacity-10 flex items-center justify-center`}>
                    <div className={`w-8 h-8 rounded-full ${card.color} flex items-center justify-center`}>
                      <span className="text-white text-sm">{card.icon}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📋</span>
                  My Tasks
                </h2>
                <button className="text-[#5A9690] text-sm font-medium">View All</button>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {filterButtons.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeFilter === filter
                        ? 'bg-[#D97D55] text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Task List */}
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#5A9690] transition-colors duration-200 group">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id)}
                        className="w-5 h-5 text-[#5A9690] rounded focus:ring-[#5A9690]"
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{task.icon}</span>
                        <div>
                          <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">{task.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'High' 
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1.5 text-[#5A9690] hover:bg-[#5A9690] hover:text-white rounded transition-colors duration-200"
                          title="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Task Statistics */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">📈</span>
                  Task Statistics
                </h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                   <span className="text-[#5A9690] font-semibold">{completionRate}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#5A9690] h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#5A9690]">{completedCount}</p>

                      <p className="text-gray-600 text-sm">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#D97D55]">{pendingCount}</p>
                      <p className="text-gray-600 text-sm">Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">🔄</span>
                  Recent Activity
                </h2>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200 group">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'Done' ? 'bg-green-500' : 'bg-[#D97D55]'
                        }`}></div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{activity.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{activity.task}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'Done' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {activity.status}
                        </span>
                        
                        {/* Delete Activity Button */}
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Delete activity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">➕</span>
                Add New Task
              </h3>
              <button 
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D97D55] hover:bg-[#c86a45] text-white rounded-lg transition-colors duration-200"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">✏️</span>
                Edit Task
              </h3>
              <button 
                onClick={() => setIsEditTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9690] focus:border-[#5A9690]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5A9690] hover:bg-[#4a857f] text-white rounded-lg transition-colors duration-200"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;