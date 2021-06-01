#Billed - use cases text descriptions

##case 1 : User Logs in
1. User navigates to index.html
1. App renders the login page
1. User chooses the pannel corresponding to his status
1. User types his email address
1. User types his password
1. User clicks on submit button
1. App checks the email address format validity (string@string)
    * if uncorrect : the app focuses the email adess field and displays an error message "please provide a valid email address"
    * if correct : go to next step
1. App checks the database for the email address and password couple
    * if not found : the app focuses the email adess field and displays an error  message "email address and/or password is uncorrect"
    * if found : go to next step
1. User is successfully logged to the app
1. App navigates to the welcome page of the user :
    * if user has choosen employee pannel : navigate to #employee/bills
    * if user has choosen admin pannel : navigate to #admin/dashboard


##case 2 : Employee accesses personnal summary table
This case begins when Employee successfully logged in (case 1)
1. App renders the summary table containing all previously submitted bills by the employee and displaying all the significant info :
    * type of the expense
    * name of the expense
    * date of the expense
    * amount of the expense (tax included)
    * status of the bill
    * button to see attached file


##case 3 : Admin accesses dashboard
This case begins when Admin successfully logged in (case 1)
1. App renders the dashboard containing three menus on the left pannel (pending, approved, denied) and a blank main area
1. App displays the number of bills  in the menu label for each of three status
1. Admin clicks on one of the menus
1. App expands the menu and renders the list of the bills corresponding to this status, the following info are displayed for each bills :
    * type of the expense
    * name of the expense
    * date of the expense
    * amount of the expense (tax included)
1. Admin clicks on one of the expanded menu
1. App wraps the menu, hidding the list of the bills corresponding to this status

##case 4 : User logs out
This case begins when User successfully logged in (case 1) or during any steps of any other cases
1. User  clicks on the logout button
1. App logout User
1. App render the login page (see case 1 step 2)

##case 5 : Admin accesses bill's detail
This case begins when Admin successfully logged in and has expanded on menu (case 3 step 3)
1. Admin click on one of the bills in the list of one of the expanded menu
1. App renders the bill's information in the main pannel. the information contains : 
    * type of the expense
    * name of the expense
    * date of the expense
    * amount of the expense (tax included)
    * tax rate
    * amount of tax
    * Employee's comment
    * status of the bill
    * name of the attached file
    * button to see attached file
    * Admin's comment (can be modified)
1. Admin click on antoher bills in the list of one of the expanded menu 
1. App renders the bills information in the main pannel replacing previous ones

##case 6: User displays bill's attached file
This case begins when User successfully logged in and depending on user status:
* Admin : after accessing bills details (case 4 step 2)
* Employee : after accessing personnal summary table (case 2 step 1)
1. User clicks on the see attached file button
1. App renders a modal over the page. the modal contains : 
    * the display of the attached file
    * a button to close the modal
    * a button to download the attached file
1. User clicks on the close button of the modal
1. App derenders the modal

##case 7: User downloads bill's attached file
This case begins when User successfully logged in and has displayed a bill's attached file (case 6 step 2):
1. User click on the download attached file button
1. App open "save as" window on the User's device. default name for the attached file is the name of the attached file
1. User selects a path where to save the attached file on his device
1. User chooses a name for the attached file
1. User clicks on save button
1. User's device save the file in the selected path under the choosen name

##case 7b: User downloads bill's attached file (alt)
alternative path for case 7 
1. User click on the download attached file button
1. App open "save as" window on the User's device. default name for the attached file is the name of the attached file
1. User clicks on cancel button
1. App close the "save as" window

##case 8 : Employee checks bill's status
This case begins when Employee successfully accessed personnal summary table (case 2)
1. App displays the status of the bills within the personnal summary table

##case 9 : Employee submits new bill
This case begins when Employee successfully logged in (case 1)
1. Employee clicks on the submit new bill button
1. App render submit page. the page contains a form with the following fields :
    * type of the expense
    * name of the expense
    * date of the expense
    * amount of the expense (tax included)
    * tax rate
    * amount of tax
    * Employee's comment
    * button to add attached file
    * name of the attached file (default : "no attached file")
    * submit button
1. Employee fills the fields
1. Employee clicks on the add attached file button
1. App open a "open file" window" on the Employee's device
1. Employee chooses a file and clicks on select button
1. App close the "open file" window and download the file
1. App render the name of the choosen file in the name of the attached file field
1. User clicks on submit button
1. App checks if all the fields are valid
    * if one of the field is invalid : App focuses this field and displays an error message corresponding to the invalidity cause
    * if all are actually valid : go to next step
1. App save the form in the database
1. App renders the summary table (see case 2 step 1)


##case 10a : Admin approves submitted bill
this case is an alternative case of the case 5 : Admin accesses bill's detail
1. Admin clicks on one of the bills in the list of the pending expanded menu
1. App renders the bill's information in the main pannel. the information contains : 
    * type of the expense
    * name of the expense
    * date of the expense
    * amount of the expense (tax included)
    * tax rate
    * amount of tax
    * Employee's comment
    * status of the bill
    * name of the attached file
    * button to see attached file
    * Admin's comment (can be modified)
1.  App additionnaly renders an approved button and a deny button at the bottom of the bill's information
1. Admin clicks on the approve button 
1. App turns the bills status to approved
1. App removes this bill from the pending bills list
1. App decrements the displayed number of pending bills in the menu label
1. App adds this bill from the approved bills list
1. App increments the displayed number of approved bills in the menu label

##case 10b : Admin denies submitted bill
this case is an alternative case of the case 10a where Admin denies the bills
1. Admin clicks on one of the bills in the list of the pending expanded menu
1. App renders the bill's information in the main pannel. the information contains : 
    * type of the expense
    * name of the expense
    * date of the expense
    * amount of the expense (tax included)
    * tax rate
    * amount of tax
    * Employee's comment
    * status of the bill
    * name of the attached file
    * button to see attached file
    * Admin's comment (can be modified)
1.  App additionnaly renders an approved button and a deny button at the bottom of the bill's information
1. Admin clicks on the deny button 
1. App turns the bills status to denied
1. App removes this bill from the pending bills list
1. App decrements the displayed number of pending bills in the menu label
1. App adds this bill from the denied bills list
1. App increments the displayed number of denied bills in the menu label