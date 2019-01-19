import React from "react";
import Link from "react-router-dom/es/Link";

export default class AboutNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to="/about" className='fas fa-question nav_btn' id="about_nav_btn">About</Link>
            </div>
        );
    }
}