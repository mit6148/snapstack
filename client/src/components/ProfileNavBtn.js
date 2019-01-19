import React from "react";
import Link from "react-router-dom/es/Link";

export default class ProfileNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to={"/profile/"+this.props.appState.userId} className='fas fa-user nav_btn' id="profile_nav_btn">Profile</Link>
            </div>
        );
    }
}