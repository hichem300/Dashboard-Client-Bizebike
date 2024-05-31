let MySheets  = SpreadsheetApp.getActiveSpreadsheet();
let LoginSheet  = MySheets.getSheetByName("login"); 
let SPREADSHEET_ID = "1sho-GDBhX8BM2J8jobigAJljglZzxfsUdycb6BnZOak";
let DATA_RANGE ="Pièces!G1:R";

/**
 * Serves an HTML page generated from the 'Index' template file.
 * This function dynamically creates the content of the webpage and prepares it for display in a browser.
 * It also adds a meta tag to optimize rendering on mobile devices.
 * 
 * @returns {HtmlOutput} An HTML output object ready for the browser.
 */

function doGet(e) {
  var output = HtmlService.createTemplateFromFile('login');
  
  var sess = getSession();
  Logger.log(sess)
   if (sess.loggedIn) {
     output = HtmlService.createTemplateFromFile('index');
  }
  return output.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


/**
 *  Sets the user session.
 * This function stores the session information in the user's properties,
 * allowing for persistent session management across different executions.
 * The session data is stored as a JSON string associated with the current user's temporary active key.
 * 
 * @param {Object} session - The session object containing user-specific session data.
 */

function setSession(session) {
    var sId   = Session.getTemporaryActiveUserKey(); 
    var uProp = PropertiesService.getUserProperties();
    uProp.setProperty(sId, JSON.stringify(session));
}


/**
 * Retrieves the user session.
 * This function fetches the session information from the user's properties,
 * allowing for persistent session management across different executions.
 * If no session data is found, it returns a default session object indicating the user is not logged in.
 * 
 * @returns {Object} The session object containing user-specific session data.
 *                   If no session data is found, returns an object with 'loggedIn' set to false.
 */
function getSession() {
  var sId   = Session.getTemporaryActiveUserKey();
  var uProp = PropertiesService.getUserProperties();
  var sData = uProp.getProperty(sId);
  return sData ? JSON.parse(sData) : { loggedIn: false };
}

/**
 * Logs in a user with the provided user ID and password.
 * If the login check is successful, sets the session as logged in and returns 'success'.
 * Otherwise, returns 'failure'.
 * 
 * @param {string} pUID - The user ID.
 * @param {string} pPassword - The password.
 * @returns {string} The login result, either 'success' or 'failure'.
 */

function loginUser(pUID, pPassword) {
  if (loginCheck(pUID, pPassword)) {
    var sess = getSession();
    sess.loggedIn = true;
    sess.userID = pUID; // Ensure userID is set in session
    setSession(sess);
    return 'success';
  } else {
    return 'failure';
  }
}



/**
 * Retrieves the ClientID for the given user ID.
 * @param {string} pUID - The user ID.
 * @returns {string|null} The ClientID if found, or null if not found.
 */
function getClientID(pUID) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('login'); // Replace with your spreadsheet ID and sheet name
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === pUID) { // Assuming the email/user ID is in the first column
      return data[i][4]; // Assuming the Client ID is in the fifth column (index 4)
    }
  }
  return null;
}




/**
 * Logs out the current user by setting the session as logged out.
 */
function logoutUser() {
  var sess = getSession();
  sess.loggedIn = false;
  setSession(sess);
}

/**
 * Checks if the provided user ID and password are correct.
 * 
 * @param {string} pUID - The user ID.
 * @param {string} pPassword - The password.
 * @returns {boolean} True if the login credentials are correct, false otherwise.
 */
   /* function loginCheck(pUID, pPassword) {
    let LoginPass =  false;
      let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();
        
        ReturnData.forEach(function (range) {
          let StartRow = range.getRow();
          let TmpPass = LoginSheet.getRange(StartRow, 2).getValue();
          if (TmpPass == pPassword)
          {
              LoginPass = true;
          }
        });

    return LoginPass;
}*/

function loginCheck(pUID, pPassword) {
    let LoginPass = false;
    let clientID = "";
    let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();

    ReturnData.forEach(function (range) {
        let StartRow = range.getRow();
        let TmpPass = LoginSheet.getRange(StartRow, 2).getDisplayValue();
        if (TmpPass === pPassword) {
            LoginPass = true;
            clientID = LoginSheet.getRange(StartRow, 5).getDisplayValue(); // Assuming Client ID is in the fifth column
        }
    });

    Logger.log(clientID)

    if (LoginPass) {
        if (clientID) {
            return "success";
        } else {
            return "failure";
        }
    }
}

function test(){

    Logger.log(loginCheck("h.dahmani@bizebike.com", "123"))

}

/**
 * Opens and returns the content of an HTML page.
 * 
 * @param {string} PageName - The name of the HTML page file.
 * @returns {string} The content of the HTML page.
 */
    function OpenPage(PageName)
    {
    return HtmlService.createHtmlOutputFromFile(PageName).getContent();
}

/**
 * Registers a new user with the provided user ID, password, and name.
 * If the user already exists, returns a warning message.
 * Otherwise, registers the user and returns a success message.
 * 
 * @param {string} pUID - The user ID.
 * @param {string} pPassword - The password.
 * @param {string} pName - The name of the user.
 * @returns {string} The registration result message.
 */

    function UserRegister(pUID, pPassword, pName) {
    
    let RetMsg = '';
    let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();
    let StartRow = 0;
    ReturnData.forEach(function (range) {
      StartRow = range.getRow();
    });

    if (StartRow > 0) 
    {
      RetMsg = 'danger, User Already Exists';
    }
    else
    {
      let uuid = generateUUID(); // Generate UUID for new user
      LoginSheet.appendRow([pUID, pPassword, pName,uuid]) ;  
      RetMsg = 'success, User Successfully Registered'; 
    }

    return  RetMsg;
}

/**
 * Sends a One-Time Password (OTP) to the user's email for login verification.
 * 
 * @param {string} id - The email address to send the OTP to.
 * @param {string} nm - The name of the user.
 * @returns {string} The result message indicating the OTP has been sent.
 */
    function sendPassword(id,nm)
    {
   let OTP = "" + Math.ceil((Math.random() + 1) * 1000);
   OTP = OTP.substring(0,4);

   let MsgBody =   "<h4>Hello, <b>"+nm+"</b><p>Your OTP for Login</p></h4><h1>"+OTP+"</h1>";
   
   //MailApp.sendEmail(id, "OTP For Login", MsgBody);
    MailApp.sendEmail({to: id, subject: "OTP For Login", htmlBody: MsgBody});
    

    var sess = getSession();
    sess.OTP = OTP;
    setSession(sess);

    return 'success, Vérifier votre e-mail pour le code OTP';
}

/**
 * Checks the provided OTP against the stored session OTP.
 * If the OTP is correct, registers the user and returns the registration result.
 * Otherwise, returns a warning message indicating the OTP is incorrect.
 * 
 * @param {string} pUID - The user ID.
 * @param {string} pPassword - The password.
 * @param {string} pName - The name of the user.
 * @param {string} pOTP - The OTP provided by the user.
 * @returns {string} The result message indicating success or failure.
 */
    function CheckOTP(pUID, pPassword, pName, pOTP)
    {
    var sess = getSession();
     if (sess.OTP == pOTP) 
     {
          return UserRegister(pUID, pPassword, pName) ;
     }
     else
     {
          return 'danger, OTP incorrect';

     }
}

/**
 * Handles the 'forgot password' process by sending the user's password to their email.
 * If the user exists, sends an email with the password.
 * Otherwise, returns a warning message indicating the user does not exist.
 * 
 * @param {string} pUID - The user ID.
 * @returns {string} The result message indicating success or failure.
 */
    function forgotPass(pUID)
    {

    let RetrunMsg = "warning,Utilisateur n'existe pas";

    let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();
    let StartRow = 0;
    ReturnData.forEach(function (range) {
      StartRow = range.getRow();
    });


    if (StartRow > 0) 
    {
        let userName = LoginSheet.getRange(StartRow, 3).getValue();
        let userPass = LoginSheet.getRange(StartRow, 2).getValue();

        let MsgBody  =   "<h4>Hello, <b>"+userName+"</b><p>Your Password is </p></h4><h1>"+userPass+"</h1>";
      
        MailApp.sendEmail({to: pUID, name:"Imagination", subject: "Your Password", htmlBody: MsgBody});
        RetrunMsg = 'success, Password has been sent to your Mail';
    }

    return RetrunMsg;
}

/**
 * Generates a UUID (Universally Unique Identifier).
 * This function creates a unique identifier using the current timestamp and, if available,
 * the high-resolution time since the page loaded.
 * 
 * @returns {string} A UUID string in the format 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.
 */
function generateUUID() { 
    var d = new Date().getTime(); //Timestamp
    var d2 = (typeof performance !== 'undefined' && performance.now && (performance.now()*1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if(d > 0){ //Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else { //Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
    });
}


/**
 * Fetches and formats data from a Google Sheet into an array of objects.
 * Expects the first row of the data range to contain column headers.
 *
 * @param {string} SPREADSHEET_ID The ID of the Google Spreadsheet.
 * @param {string} DATA_RANGE The range of cells containing the data.
 * @returns {array} An array of objects representing the spreadsheet data. 
 */
function getData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pièces');
  const range = sheet.getRange('D1:S');  // Adjust range accordingly
  const data = range.getDisplayValues();

  // Log data to check if it is correctly retrieved
  Logger.log(data);

  if (!data || data.length === 0) {
    Logger.log('No data found.');
    return [];
  }

  // Extract headers
  const headers = data.shift(); // Remove the first row and use it as headers

  // Log headers to check if they are correctly extracted
  Logger.log(headers);

  // Format the rest of the data as objects
  const tableData = data.map(row => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i] || ''; // Handle undefined values
    }
    return obj;
  });

  Logger.log(tableData);
  return tableData;
}

/**
 * Includes the content of an external HTML file.
 * 
 * @param {string} fileName The name of the HTML file to include.
 * @returns {string} The HTML content of the file.
 */
function include(fileName) {
  return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}



/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function pageURL(){
  return ScriptApp.getService().getUrl();
}