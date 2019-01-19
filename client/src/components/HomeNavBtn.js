import React from "react";
import Link from "react-router-dom/es/Link";

export default class HomeNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to="/" className='fas fa-home nav_btn' id='home_nav_btn'>Home</Link>
            </div>
        );
    }
}

