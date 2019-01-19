import React from "react";

export default class AboutNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to="/about" className='fas fa-question nav_btn' id="about_nav_btn">About</Link>
            </div>
        );
    }
}