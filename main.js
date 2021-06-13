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

//生成qrCode
function qrCode(){
    $('#qrcode').qrcode('this plugin is great');
}

//admin login 管理員登入
function adminLogin(){
    var ac = document.getElementById("adminId").value
    var pw = document.getElementById("adminPw").value
    firebase.auth().signInWithEmailAndPassword(ac + "@gmail.com",pw)
    .then((userCredential) => {
        setAdminCookie(ac,pw)
        alert("登入成功")
        //userCredential.user
        hideLoginInterface()
        firebase.database().ref('Employee').once('value').then((snapshot) => {
            if(snapshot.val() != null){
                var employee = snapshot.val()
                var str = employee.split(",")
                for(i = 0 ; i < str.length ; i++){
                    createTable(1,str[i],"")
                }
            }
        })
    })
    .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("errorCode:" + errorCode + "  errorMessage:" + errorMessage)
    alert("登入失敗，帳號或密碼錯誤")
    })
}

//admin logout 管理員登出
function adminLogout(){
    firebase.auth().signOut()
    alert("登出成功，即將回到打卡簽到介面")
    dynamicForm(0)
}

//刷新表格內容
function updateTable(){
    cleanTable(1)
    firebase.database().ref('Employee').once('value').then((snapshot) => {
        if(snapshot.val() != null){
            var employee = snapshot.val()
            var str = employee.split(",")
            for(i = 0 ; i < str.length ; i++){
                createTable(1,str[i],"")
            }
        }
    })
    //setLastNum()
}

//add employee 添加員工
function addEmployee(){
    var database = firebase.database()
    var text = document.getElementById('employeeName').value
    if(text != ""){
        database.ref('Employee').once('value').then((snapshot) => {
            if(snapshot.val() != null){
                var employee = snapshot.val() + "," + text
                database.ref('Employee').set(employee)
                updateTable()
                alert("新增成功")
            }
        })
    }
    else{
        alert("請先輸入姓名")
    }
}

//del employee 刪除員工
function delEmployee(){
    var database = firebase.database()
    var text = document.getElementById('employeeName').value
    if(text != ""){
        database.ref('Employee').once('value').then((snapshot) => {
            if(snapshot.val() != null){
                var employee = snapshot.val()
                var str = employee.split(",")
                var employeeN = ""
                str = str.filter(function(item) {
                    return item != text
                })
                for(i = 0 ; i < str.length ; i++){
                    if(i == 0){employeeN = str[i]}
                    else{employeeN = employeeN + "," + str[i]}
                }
                database.ref('Employee').set(employeeN)
                updateTable()
                alert("刪除成功")
            }
            else{alert("找不到該名員工")}
        })
    }
    else{
        alert("請先輸入姓名")
    }
}

//login success hide login interface 登入成功隱藏登入畫面，並顯示員工清單
function hideLoginInterface(){
    document.getElementById("form2").style.display = "none"
    document.getElementById("form3").style.display = "block"
}

//設置管理員登入時的帳戶cookie
function setAdminCookie(ac,pw){
    document.cookie = ac + "=" + pw + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

//設置普通cookie，還沒用到
function setCookie(name){
    document.cookie = name + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

//return back clockIn 回到簽到畫面
function backToClockIn(){
    dynamicForm(0)
}

//admin login Interface 顯示登入畫面
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

//日期加減 i == 0 add 加 , i == 1 sub 減, j == count 次數
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

//Clock 時鐘
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

//檢查日期 體溫回報時用的，沒用到
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
function createTable(tableName,dateOrName,time){
    if(tableName == 0){
        var td1 = document.createElement('td')
        td1.appendChild(document.createTextNode(dateOrName))
        var td2 = document.createElement('td')
        td2.appendChild(document.createTextNode(time))
        var tr1 = document.createElement('tr')
        tr1.appendChild(td1)
        tr1.appendChild(td2)
        var table = document.getElementsByTagName('table')[0]
        table.appendChild(tr1)
    }
    else if(tableName == 1){
        var td1 = document.createElement('td')
        td1.appendChild(document.createTextNode(dateOrName))
        var tr1 = document.createElement('tr')
        tr1.appendChild(td1)
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
