import User from "./User.js";
import Course from "./Course.js";
import Review from "./Review.js";
import Enrollment from "./Enrollment.js";

const defineAssociations = () => {
  // User and Course many-to-many relationship through Enrollment
  User.belongsToMany(Course, { through: Enrollment, foreignKey: "userId", as: "enrolledCourses" });
  Course.belongsToMany(User, { through: Enrollment, foreignKey: "courseId", as: "students" });

  // User and Course one-to-many relationship for reviews
  User.hasMany(Review, { foreignKey: "authorId", as: "reviews" });
  Review.belongsTo(User, { foreignKey: "authorId", as: "author" });

  Course.hasMany(Review, { foreignKey: "courseId", as: "reviews" });
  Review.belongsTo(Course, { foreignKey: "courseId", as: "course" });

  // Existing associations
  User.hasMany(Course, { foreignKey: "instructorId", as: "courses" });
  Course.belongsTo(User, { foreignKey: "instructorId", as: "instructor" });
};

export default defineAssociations;