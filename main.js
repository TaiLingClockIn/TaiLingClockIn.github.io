// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyB7NlPieXyBMq9V7JJraaD4-GiA00dv6BM",
    authDomain: "clockinproj.firebaseapp.com",
    databaseURL:"https://clockinproj-default-rtdb.firebaseio.com",
    projectId: "clockinproj",
    storageBucket: "clockinproj.appspot.com",
    messagingSenderId: "89336972600",
    appId: "1:89336972600:web:d8e61ea215ef8236ed6dcd",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.database().goOnline();
updateDate()
setInterval(updateDate, 1000);
var employeeCount = 0
var lastNum = 0
var emptyNum = ""

//qrCode
function qrCode(){
    $('#qrcode').qrcode('this plugin is great');
}

//admin login
function adminLogin(){
    var ac = document.getElementById("adminId").value
    var pw = document.getElementById("adminPw").value
    var tmp = 1
    firebase.auth().signInWithEmailAndPassword(ac + "@gmail.com",pw)
    .then((userCredential) => {
        setAdminCookie(ac,pw)
        //userCredential.user
        firebase.database().ref('EmployeeCount').once('value').then((snapshot) => {
            employeeCount = snapshot.val()
        })
        firebase.database().ref('EmptyNum').once('value').then((snapshot) => {
            emptyNum = snapshot.val()
        })
        firebase.database().ref('Employee/LastNum').once('value').then((snapshot) => {
            lastNum = snapshot.val()
            hideLoginInterface()
            var tmp = 0
            for(i = 0 ; i <= lastNum ; i++){
                firebase.database().ref('Employee/'+ i).once('value').then(function(snapshot){
                    if(snapshot.val() != null){
                        createTable(1,tmp,snapshot.val())
                    }
                    tmp+=1
                })
            }
        })
    })
    .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("errorCode:" + errorCode + "  errorMessage:" + errorMessage)
    })
}

//admin logout
function adminLogout(){
    dynamicForm(0)
    firebase.auth().signOut()
}

//刷新表格內容
function updateTable(){
    cleanTable(1)
    var tmp = 0
    for(i = 0 ; i <= lastNum ; i++){
        firebase.database().ref('Employee/'+ i).once('value').then(function(snapshot){
            if(snapshot.val() != null){
                createTable(1,tmp,snapshot.val())
            }
            tmp+=1
        })
    }
    //setLastNum()
}

//add employee
function addEmployee(){
    var database = firebase.database()
    var text = document.getElementById('employeeName').value
    if(text != ""){
        if($.isNumeric(text) == false){
            if(emptyNum == ""){
                database.ref('Employee/' + employeeCount).set(text)
                if(lastNum<employee){database.ref('Employee/LastNum').set(employeeCount)}
            }
            else{
                database.ref('Employee/' + Number(getTextLeft(emptyNum,","))).set(text)
                if(Number($("table tr:last td:eq(-2)").text())<Number(getTextLeft(emptyNum,","))){database.ref('Employee/LastNum').set(Number(getTextLeft(emptyNum,",")))}
                database.ref('EmptyNum').set(emptyNum.replace(getTextLeft(emptyNum,",")+",",""))
                emptyNum = emptyNum.replace(getTextLeft(emptyNum,",")+",","")
            }
            employeeCount+=1
            database.ref('EmployeeCount').set(employeeCount)
            updateTable()
            alert("新增成功")
            document.getElementById('employeeName').value = ""
            setLastNum()
        }
        else{
            alert("新增請輸入姓名")
        }

    }
    else{
        alert("請先輸入姓名")
    }
}

//del employee
function delEmployee(){
    var database = firebase.database()
    var text = document.getElementById('employeeName').value
    if(text != ""){
        if($.isNumeric(text)){
            database.ref('Employee/' + Number(text)).remove()
            employeeCount-=1
            database.ref('EmployeeCount').set(employeeCount)
            database.ref('EmptyNum').set(emptyNum + "," + text)
            updateTable()
            alert("刪除成功")
            document.getElementById('employeeName').value = ""
            setLastNum()
        }
        else{
            alert("請輸入序號，暫不支持姓名刪除")
        }
    }
    else{
        alert("請先輸入序號")
    }
}

//設置最後一號
function setLastNum(){
    var database = firebase.database()
    setTimeout(function(){
        var last = Number($("table tr:last td:eq(-2)").text())
        if(last != 0){database.ref('Employee/LastNum').set(last)}
    },1000)
}

//sleep function
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

//login success hide login interface
function hideLoginInterface(){
    document.getElementById("form2").style.display = "none"
    document.getElementById("form3").style.display = "block"
}

function setAdminCookie(ac,pw){
    document.cookie = ac + "=" + pw + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

function setCookie(name){
    document.cookie = name + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

//return back clockIn
function backToClockIn(){
    dynamicForm(0)
}

//admin login Interface
function adminLoginInterface(){
    dynamicForm(1)
    if(document.cookie != null){
        document.getElementById("adminId").value = getTextLeft(document.cookie,"=")
        document.getElementById("adminPw").value = getTextRight(document.cookie,"=")
    }
}

//開啟登入介面 0 == 打卡, 1 == 管理員登入
function dynamicForm(i){
    if(i == 0){
        document.getElementById("form1").style.display = "block"
        document.getElementById("form2").style.display = "none"
        document.getElementById("form3").style.display = "none"
    }
    else if(i == 1){
        document.getElementById("form1").style.display = "none"
        document.getElementById("form2").style.display = "block"
        document.getElementById("form3").style.display = "none"
    }
}

//字串處理(取左邊)
function getTextLeft(str,match){
    var p = 0

    for(i = 0 ; i < str.length ; i++){
        if(str.charAt(i) == match){
            p = i
            break
        }
    }

    if(p != 0){
        return str.slice(0,p)
    }
    else{
        return ""
    }
}

//字串處理(取右邊)
function getTextRight(str,match){
    var p = 0

    for(i = 0 ; i < str.length ; i++){
        if(str.charAt(i) == match){
            p = i+1
            break
        }
    }

    if(p != 0){
        return str.slice(p,str.length)
    }
    else{
        return ""
    }
}

//Get current time i == 0 日期時間星期 , i == 1 排除星期 , i == 2 排除時間 , i == 3 只有時間
function GetTime(i){
    var time = new Date()
    var y = time.getFullYear()
    var m = time.getMonth()+1
    var d = time.getDate()
    var hour = time.getHours()
	var mins = time.getMinutes()
    var sec = time.getSeconds()
    var day = time.getDay()
    var day_list = ['日','一','二','三','四','五','六']

    if(m < 10){m = "0" + m}
    if(d < 10){d = "0" + d}
    if(hour < 10){hour = "0" + hour}
    if(mins < 10){mins = "0" + mins}
    if(sec < 10){sec = "0" + sec}

    if(i == 0){
        return "" + y + "/" + m  +"/"+ d + " " + hour + ":"  + mins + ":" + sec + " ,星期" + day_list[day]
    }
    else if(i == 1){
        return "" + y + m + d + hour + mins + sec
    }
    else if(i == 2){
        return "" + y + m + d
    }
    else if(i == 3){
        return "" + hour + ":" + mins + ":" + sec
    }
}

//日期加減 i == 0 add , i == 1 sub , j == count
function DateCale(i,j){
        var dateTime = new Date()
        if(i == 0){dateTime = dateTime.setDate(dateTime.getDate() + j)}
        else if(i == 1){dateTime = dateTime.setDate(dateTime.getDate() - j)}
        dateTime = new Date(dateTime)
        var y = dateTime.getFullYear()
        var m = dateTime.getMonth() + 1
        var d = dateTime.getDate()
        if(m < 10){m = "0" + m}
        if(d < 10){d = "0" + d}
        return "" + y + m + d
}

//Clock
function updateDate() {
    var timer = document.getElementById("date")
	timer.textContent = GetTime(0);
}

//上傳資料
function uploadData(){
    var userId = document.getElementById('userId').value
    var database = firebase.database()
    var detailDate = GetTime(0)
    var date = GetTime(2)
    var time = GetTime(3)

    if(document.getElementById('div1').style.display == "block"){displayTable()}

    if(userId != "" ){
        
        database.ref('DetailedRecords/' + date + '/' + userId ).once("value").then(function(snapshot){
            var val = snapshot.val()
            if(val == null){
                database.ref('DetailedRecords/' + date + '/' + userId).set({
                    Date : date,
                    Time : time,
                    })
                database.ref('Records/' + userId).child(date).set(time)
                database.ref('ReportCount/' + userId).once('value').then(function(snapshot){
                    var tmp = snapshot.val()
                    if(tmp == null){
                        database.ref('ReportCount/' + userId).child('Count').set(1)
                    }
                    else{
                        var count = tmp.Count
                        count+=1
                        database.ref('ReportCount/' + userId).child('Count').set(count)
                    }
                })
                alert("打卡完畢，姓名：" + userId +  "  打卡時間：" + detailDate)
            }
            else{
                alert("今天已經打卡過囉")
            }
        })
    }
    else{
        alert("請輸入姓名")
    }

}

//檢查日期
function checkDate(dateP){
    if(dateP.length == 0){
        return true
    }
    else if(dateP.length == 8){
        if(Number(dateP.slice(0,4)) > 2020 && Number(dateP.slice(4,6)) <= 12 && Number(dateP.slice(4,6)) > 0 && Number(dateP.slice(6,8)) <= 31 && Number(dateP.slice(6,8)) > 0){
            return true
        }
        else{
            return false
        }
    }
    else{
        return false
    }
}

//顯示表格
function displayTable(){
    if(document.getElementById('div1').style.display == "block"){
        document.getElementById('div1').style.display = "none"
    }
    else{
        document.getElementById('div1').style.display = "block"
    }
}

//獲取資料庫中個人的每日打卡紀錄
function getRecords(){
    cleanTable(0)

    var userId = document.getElementById('userId').value
    var database = firebase.database()
    var date = GetTime(2)
    var count = 0
    var i = 0
    var DataCount = 0

    if(userId != ""){
        if(document.getElementById('div1').style.display != "block"){displayTable()}

        database.ref('ReportCount/' + userId).once('value').then(function(snapshot){
            var val = snapshot.val()
            if(val != null){
                DataCount = val.Count
            }
        })
        
        if(DataCount >= 5){
            while(count < 5){
                date = DateCale(1,i)
                database.ref('DetailedRecords/' + date + '/' + userId).once("value").then(function(snapshot){
                    var val = snapshot.val();
                    if(val != null){
                        createTable(0,val.Date,val.Time)
                        count+=1
                    }
                })
                i+=1
            }
        }
        else{
            for(j = 0 ; j <= DataCount ; j++){
                date = DateCale(1,j)
                database.ref('DetailedRecords/' + date + '/' + userId).once("value").then(function(snapshot){
                    var val = snapshot.val();
                    if(val != null){
                        createTable(0,val.Date,val.Time)
                    }
                })
            }
        }
    }
    else{
        alert("請先輸入姓名，才可查詢紀錄")
    }
}

//創建表格 參數一 == 第幾個Table , 參數二、三 == 表格內容
function createTable(tableName,dateOrListnum,timeOrName){
    var td1 = document.createElement('td')
    td1.appendChild(document.createTextNode(dateOrListnum));
    var td2 = document.createElement('td')
    td2.appendChild(document.createTextNode(timeOrName));
    var tr1 = document.createElement('tr')
    tr1.appendChild(td1)
    tr1.appendChild(td2)
    if(tableName == 0){
        var table = document.getElementsByTagName('table')[0]
        table.appendChild(tr1)
    }
    else if(tableName == 1){
        var table = document.getElementsByTagName('table')[1]
        table.appendChild(tr1)
    }
}

//清空表格 i == 0 table[0] , i == 1 table[1]
function cleanTable(i){
    var table = document.getElementsByTagName('table')[0]
    if(i == 1){table = document.getElementsByTagName('table')[1]}
    while(table.rows.length > 1){
        table.deleteRow(1)
    }
}
