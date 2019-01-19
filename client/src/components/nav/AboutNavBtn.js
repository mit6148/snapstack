import React from "react";
import Link from "react-router-dom/es/Link";

import "../../css/nav.css";

export default class AboutNavBtn extends React.Component {
    render() {
        return (
            <div className= ''>
                <Link to="/about" className='fas fa-info nav_btn' id="about_nav_btn"></Link>
            </div>
        );
    }
}