(window.onload = function(){

  window.isInspectorOpen = false;
	  
  var sourceEle = window.document.getElementById('btn');
  sourceEle = window.document;
  var pathToast = window.document.getElementById('pathToast');
  var htmlInspecToast = window.document.getElementById('htmlInspecCode');
  
  let htmlString = document.getElementsByTagName('html')[0].innerHTML;
  var pretty = require('pretty');
  pretty(htmlString,{ocd:true}); 
  //htmlInspecToast.value= htmlString -> 这里不能用.value因为.value是textarea的，可以用innerText或textContent	
  htmlInspecToast.innerText= htmlString;
  
  var windowDoc = window.document; 
  var edgeBorderStyle = "2px solid blue";
  
  //
  windowDoc.onmouseover = function (e){
	let ele = getEleByEvent(e);  
	ele.style.border = edgeBorderStyle; //改变当前系统的css的style为 2px solid blue
	//this.textBox2.Text = e.toElement.parentElement.innerHTML;
	pathToast.value = getHtmlTreePath(ele);
	if (isInspectorOpen) {
	  //change color on text 	
	}
  } 
  
  windowDoc.onmouseout = function (e){
	let ele = getEleByEvent(e);  
	ele.style.border = ""; //去掉边框 
  } 
  
  //
  windowDoc.onclick = function(e){ 		//这里不能写event
	let tag = getEleByEvent(e); 
	pathToast.value = getHtmlTreePath(tag);//.innerHTML;
  }
  

  function getEleByEvent(e){	//这里不能写event
	//创建当前window对象event 
	let ev  = e || window.event;	//这里的e不能写成event，尽管形参为event(因为这里的event是window.event：上一层作用域的event)
	let ele = ev.target||ev.srcElement; 
	return ele;
  }
  
  function getHtmlTreePath(obj) {
	let path = ''; 
	let element = obj;
	while (element != null){ //这里的数据结构像是链表结构 //最好用parentNode而不用parentElement，因为是parentNode是W3C标准
			//当前元素tag名											//累计的tag名（从最初的tag到当前所有的）
	  path = element===obj? element.tagName : element.tagName + " > " + path;
	  element = element.parentElement;  //移动到链表的上一层元素，获取父元素	
	}
	return path;
  }
  
  
  
})();	
	