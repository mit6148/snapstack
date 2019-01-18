import React from "react";

export default class ProfileNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to={"/profile/"+this.props.appState.user} className="profile_nav_btn">Profile</Link>
            </div>
        );
    }
}