/** @module views/VerticalLayout */
import WindowIcon from "../assets/svg/window.js"
import MailIcon from "../assets/svg/mail.js"
import DisconnectIcon from "../assets/svg/disconnect.js"

/**
 * function VerticalLayout - build UI of the VerticalLayout
 * @function
 * @param {number} height - the height of the screen page, in vh
 * @return {string} the UI of the vertical layout to be used in the Bills, NewBill and Dashboard pages
 */
export default (height) => {
    let user;
    user = JSON.parse(localStorage.getItem('user'))
    if (typeof user === 'string') {
      user = JSON.parse(user)
    }
    if (user && user.type === 'Employee') {
      return (
        `
        <div class='vertical-navbar' style='height: ${height}vh;'>
          <div class='layout-title'> Billed </div>
          <div id='layout-icon1' data-testid="icon-window">
            ${WindowIcon}
          </div>
          <div id='layout-icon2' data-testid="icon-mail">
            ${MailIcon}
          </div>
          <div id='layout-disconnect'>
            ${DisconnectIcon}
          </div>
      </div>
        `
      ) 
    } else {
      return (
        `
        <div class='vertical-navbar' style='height: ${height}vh;'>
          <div class='layout-title'> Billed </div>
            <div id='layout-disconnect' data-testid='layout-disconnect'>
              ${DisconnectIcon}
            </div>
          </div>
        `
      )
    }
}