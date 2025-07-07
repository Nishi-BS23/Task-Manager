import TaskForm from "../components/TaskForm"
import TaskList from "../components/TaskList"

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <h1 className="text-lg mb-5">Task Manager</h1>
            <TaskForm />
            <TaskList />
        </div>
    )
}

export default Home
