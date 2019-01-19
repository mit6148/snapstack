import React from "react";

export default class AboutNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to="/about" class='fas fa-question' className='nav_btn' id="about_nav_btn">About</Link>
            </div>
        );
    }
}