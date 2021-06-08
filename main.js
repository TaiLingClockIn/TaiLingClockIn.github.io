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
    var frequency = 0

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
                    var count = tmp.Count
                    if(tmp == null){
                        database.ref('ReportCount/' + userId).child('Count').set(1)
                    }
                    else{
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
    cleanTable()

    var userId = document.getElementById('userId').value
    var database = firebase.database()
    var date = GetTime(2)
    var count = 0
    var i = 0
    var count = 0

    if(userId != ""){
        if(document.getElementById('div1').style.display != "block"){displayTable()}

        database.ref('ReportCount/' + userId).once('value').then(function(snapshot){
            var val = snapshot.val()
            if(val != null){
                count = val.Count
            }
        })
        
        if(count >= 5){
            while(count < 5){
                date = DateCale(1,i)
                database.ref('DetailedRecords/' + date + '/' + userId).once("value").then(function(snapshot){
                    var val = snapshot.val();
                    if(val != null){
                        createTable(val.Date,val.Time)
                        count+=1
                    }
                })
                i+=1
            }
        }
        else{
            for(j = 0 ; j <= count ; j++){
                date = DateCale(1,j)
                database.ref('DetailedRecords/' + date + '/' + userId).once("value").then(function(snapshot){
                    var val = snapshot.val();
                    if(val != null){
                        createTable(val.Date,val.Time)
                    }
                })
            }
        }
    }
}

//創建表格
function createTable(date,temperature){
    var td1 = document.createElement('td')
    td1.appendChild(document.createTextNode(date));
    var td2 = document.createElement('td')
    td2.appendChild(document.createTextNode(temperature));
    var tr1 = document.createElement('tr')
    tr1.appendChild(td1)
    tr1.appendChild(td2)
    var table = document.getElementsByTagName('table')[0]
    table.appendChild(tr1)
}

//清空表格
function cleanTable(){
    var table = document.getElementsByTagName('table')[0]
    while(table.rows.length > 1){
        table.deleteRow(1)
    }
}