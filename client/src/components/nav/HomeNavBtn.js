import React from "react";
import Link from "react-router-dom/es/Link";

import "../../css/nav.css";

export default class HomeNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to="/" className='fas fa-home nav_btn' id='home_nav_btn'></Link>
            </div>
        );
    }
}

