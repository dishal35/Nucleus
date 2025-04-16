import User from "./User.js";
import Course from "./Course.js";
import Enrollment from "./Enrollment.js";

const defineAssociations = () => {
  // User and Course many-to-many relationship through Enrollment
  User.belongsToMany(Course, { through: Enrollment, foreignKey: "userId", as: "enrolledCourses" });
  Course.belongsToMany(User, { through: Enrollment, foreignKey: "courseId", as: "students" });

  // Existing associations
  User.hasMany(Course, { foreignKey: "instructorId", as: "courses" });
  Course.belongsTo(User, { foreignKey: "instructorId", as: "instructor" });
};

export default defineAssociations;