import React from "react";

export default class ProfileNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to={"/profile/"+this.props.appState.user_id} class='fas fa-user' className='nav_btn' id="profile_nav_btn">Profile</Link>
            </div>
        );
    }
}