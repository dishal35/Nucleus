import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Otp = sequelize.define("Otp", {
    email: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    otp: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    }
}, {
    timestamps: true
});

export default Otp;