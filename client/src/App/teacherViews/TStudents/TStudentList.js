import React, { Component } from "react";
import StudentCard from "./TStudentCard";
import ClassAssign from "./TClassAssign";
import AddStudentContainer from "./TAddStudentContainer";
import Paper from "material-ui/Paper";
import SelectField from "material-ui/SelectField";
import TextField from "material-ui/TextField";
import MenuItem from "material-ui/MenuItem";
import FlatButton from "material-ui/FlatButton";
import FloatingActionButton from "material-ui/FloatingActionButton";
import ContentAdd from "material-ui/svg-icons/content/add";
import "../../Styles/StudentList.css";
import RaisedButton from "material-ui/RaisedButton";

class StudentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentClass: null,
      classIndex: 0,
      open: false,
      addingClass: false,
      created: false
    };
  }

  componentDidMount() {
    if (this.props.classrooms.length) {
      this.props.loadStudents(this.props.classrooms[0]._id);
      this.setState({ currentClass: this.props.classrooms[0] });
    }
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.classrooms.length && newProps.classrooms.length) {
      this.props.loadStudents(newProps.classrooms[0]._id);
      this.setState({
        currentClass: newProps.classrooms[0]
      });
    }
  }

  handleChange = async (event, index, value) => {
    await this.setState({
      currentClass: this.props.classrooms[value],
      classIndex: value
    });

    this.props.loadStudents(this.state.currentClass._id);
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  toggleAddClass = e => {
    e.preventDefault();
    this.setState({ addingClass: !this.state.addingClass });
  };

  addClass = async e => {
    e.preventDefault();

    if (e.target.name.value) {
      const newClass = await this.props.createClassroom(
        this.props.teacherId,
        e.target.name.value
      );

      this.toggleAddClass(e);

      this.setState({
        created: true
      });
      setTimeout(() => {
        this.setState({
          created: false
        });
      }, 1500);
    }
  };

  cancelAdd = e => {
    e.preventDefault();

    this.setState({
      addingClass: !this.state.addingClass
    });
  };

  deleteClassAlert = () => {
    const userIsSure = window.confirm(
      `Are you sure you would like to delete this class: ${this.state
        .currentClass.title}`
    );
    if (userIsSure) {
      this.props.deleteClass(this.state.currentClass._id);
    }
    this.setState({
      currentClass: null
    });
  };

  deleteStudentAlert = (id, name) => () => {
    const userIsSure = window.confirm(
      `Are you sure you would like to delete this stuent: ${name}`
    );
    if (userIsSure) {
      this.props.deleteStudent(id);
    }
  };

  render() {
    return (
      <div style={{ paddingTop: "50px" }}>
        <div className="students-container">
          <Paper style={{ padding: "4px", borderRadius: "22px" }}>
            <div className="students-container-inner">
              {!this.props.classrooms.length ? (
                <h3>You have no classes! Add one to get started!</h3>
              ) : (
                <SelectField
                  floatingLabelStyle={{ color: "grey" }}
                  selectedMenuItemStyle={{ color: "#960d0d" }}
                  labelStyle={{ fontFamily: "Bree Serif" }}
                  menuItemStyle={{ fontFamily: "Bree Serif" }}
                  floatingLabelText="Current Class"
                  value={this.state.classIndex}
                  onChange={this.handleChange}
                >
                  {this.props.classrooms.map((classroom, i) => (
                    <MenuItem
                      key={classroom._id}
                      value={i}
                      primaryText={classroom.title}
                    />
                  ))}
                </SelectField>
              )}
              <br />
              {!this.state.addingClass ? (
                <p>
                  {this.state.created ? (
                    <div style={{ margin: "5px", color: "#1A8484" }}>
                      {"Created!"}
                    </div>
                  ) : null}
                  <RaisedButton
                    labelColor="#FCFCFC"
                    icon={
                      <i style={{ color: "white" }} className={"fa fa-times"} />
                    }
                    backgroundColor={"#960D0D"}
                    hoverColor={"#960D0D"}
                    label={"Delete"}
                    disabled={!this.props.classrooms.length}
                    onClick={this.deleteClassAlert}
                  />
                  <RaisedButton
                    labelColor="#FCFCFC"
                    style={{ marginLeft: "10px" }}
                    icon={
                      <i style={{ color: "white" }} className={"fa fa-plus"} />
                    }
                    backgroundColor={"#1A8484"}
                    hoverColor={"#85DCDC"}
                    label={"Class"}
                    onClick={this.toggleAddClass}
                  />
                </p>
              ) : (
                <form onSubmit={this.addClass}>
                  <TextField
                    id="name"
                    floatingLabelStyle={{ color: "grey" }}
                    underlineFocusStyle={{ borderColor: "#1A8484" }}
                    floatingLabelText="Class name"
                  />{" "}
                  <div style={{ margin: "10px" }}>
                    <FlatButton
                      backgroundColor={"#1a8484"}
                      hoverColor={"#1a8484"}
                      labelColor="#FCFCFC"
                      style={{ color: "white", marginRight: "5px" }}
                      type="submit"
                      label="Add"
                    />
                    <FlatButton
                      labelColor="#FCFCFC"
                      hoverColor={"#960d0d"}
                      style={{ color: "white" }}
                      onClick={this.cancelAdd}
                      backgroundColor={"#960d0d"}
                      label={"Cancel"}
                    />
                  </div>
                </form>
              )}
              <div>
                <ClassAssign
                  currentClass={this.state.currentClass}
                  teacherId={this.props.teacherId}
                  students={this.props.students}
                />
                <div className="student-card-container">
                  {this.props.students.map(student => (
                    <StudentCard
                      key={student._id}
                      student={student}
                      teacherId={this.props.teacherId}
                      deleteStudentAlert={this.deleteStudentAlert}
                    />
                  ))}
                  <div className="add-student">
                    <FloatingActionButton
                      backgroundColor="#960d0d"
                      onClick={this.handleOpen}
                    >
                      <ContentAdd />
                    </FloatingActionButton>
                  </div>
                </div>
              </div>
              {!this.state.currentClass ? null : (
                <AddStudentContainer
                  classId={this.state.currentClass._id}
                  open={this.state.open}
                  handleClose={this.handleClose}
                  loadStudents={this.props.loadStudents}
                />
              )}
            </div>
          </Paper>
        </div>
      </div>
    );
  }
}

export default StudentList;
