import React from "react";
import { connect } from "react-redux";

//components
import TaskList from "./TTaskList";
//actions
import { loadStudents } from "../../../redux/actions/student";
import {
	hydrateTeacherTasks,
	unAssignTask,
	bulkUnassignTask,
	editTask,
	createTask,
	deleteTask
} from "../../../redux/actions/task";
import { getAllRewards } from "../../../redux/actions/rewards";
import LoadScreen from "../../GlobalComponents/LoadScreen";

class TaskListContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			loaded: true
		};
	}

	componentDidMount() {
		this.props.hydrateTasks(this.props.userId);
		this.props.getAllRewards(this.props.userId, "Teacher");
		//hotfix
		if (!this.props.students.length) {
			if (this.props.classrooms.length) {
				this.props.classrooms.forEach(async classroom => {
					this.props.loadStudents(classroom._id);
				});
			}
		}
	}
	componentWillReceiveProps(props) {
		if (props.userId) {
			if (this.props.userId !== props.userId) {
				this.props.hydrateTasks(this.props.userId);
			}
			if (this.props.classrooms !== props.classrooms) {
				props.classrooms.forEach(async classroom => {
					this.props.loadStudents(classroom._id);
				});
			}
			if (this.props.students !== props.students) {
				this.setState({ loaded: true });
			}
		}
	}

	//unassigment functionality passed all the way down
	//to taskCard, and StudentModal
	onUnAssignAll = (task, students = null) => {
		let studentIds = students.map(student => student._id);
		this.props.bulkUnassignTask(task, studentIds);
	};
	onUnAssignOne = async (task, studentId) => {
		this.props.unAssignTask(task, studentId);
	};
	//create a task
	onCreateTask = newTask => {
		this.props.createTask(newTask);
	};
	//delete a task
	onDelete = (teacherId, taskId) => {
		this.props.deleteTask(teacherId, taskId);
	};
	//edit a task
	onEdit = (taskId, taskUpdates) => {
		this.props.editTask(taskId, taskUpdates);
	};
	onRemoveReward = (task, rewardId) => {
		//setup what the rewards should include before passing to edit
		const taskUpdates = {
			rewards: task.rewards.filter(reward => reward._id !== rewardId)
		};
		this.props.editTask(task._id, taskUpdates);
	};
	onAddReward = (task, rewardId) => {
		//server now expects the full reward to be added when modifying the task
		let reward = this.props.rewards.find(reward => reward._id === rewardId);
		this.props.editTask(task._id, {
			rewards: task.rewards.slice().concat(reward)
		});
	};

	handleOpen = () => {
		this.setState({ open: true });
	};

	handleClose = () => {
		this.setState({ open: false });
	};
	render() {
		if (this.props.tasksFetching) {
			return <LoadScreen />;
		}
		return (
			<TaskList
				unAssignAll={this.onUnAssignAll}
				unAssignOne={this.onUnAssignOne}
				tasks={this.props.tasks}
				allRewards={this.props.rewards}
				onRemoveReward={this.onRemoveReward}
				onAddReward={this.onAddReward}
				onCreateTask={this.onCreateTask}
				students={this.props.students}
				deleteTask={taskId => this.onDelete(this.props.userId, taskId)}
				editTask={this.onEdit}
				hydrateStudentList={this.hydrateStudentList}
				name={this.props.name}
				open={this.state.open}
				handleOpen={this.handleOpen}
				handleClose={this.handleClose}
				teacherId={this.props.id}
			/>
		);
	}
}
//
const mapStateToProps = state => {
	return {
		tasksFetching: state.tasks.isFetching,
		tasks: state.tasks.list,
		students: state.students,
		classrooms: state.classrooms,
		name: state.user.displayName,
		id: state.user.id,
		rewardsFetching: state.rewards.isFetching,
		rewards: state.rewards.list
	};
};

const mapDispatchToProps = dispatch => {
	return {
		loadStudents: classId => {
			dispatch(loadStudents(classId));
		},
		hydrateTasks: id => {
			dispatch(hydrateTeacherTasks(id));
		},
		unAssignTask: (task, studentId) => {
			dispatch(unAssignTask(task, studentId));
		},
		bulkUnassignTask: (task, studentIds) => {
			dispatch(bulkUnassignTask(task, studentIds));
		},
		createTask: newTask => dispatch(createTask(newTask)),
		deleteTask: (teacherId, taskId) => dispatch(deleteTask(teacherId, taskId)),
		editTask: (taskId, taskUpdates) => dispatch(editTask(taskId, taskUpdates)),
		getAllRewards: (userId, userKind) =>
			dispatch(getAllRewards(userId, userKind))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskListContainer);
