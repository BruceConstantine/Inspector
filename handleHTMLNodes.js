//注意！！！！！ 在if-else的{}里面定义的var变量，在{}外面是不能够被使用的，变量作用域已经被销毁！
//因此要在{var x = 0;}里赋值赋完成后，在此括号的后面就无法使用 x了。
/****************************************************************************************/
  /*************************************说明文档****************************************/ 
/****************************************************************************************/
 
/** 
* 每一中HTML标签都有四种状态：{结点展开状态， 结点关闭状态， 叶子显示， 结点或叶子消失状态}
*	对应为： {open, closed, leafnode, none}
*   这四种状态将用来表示任意一个HTML元素标签的结构
* 用户在点击等事件发生时，将作用在元素的这四种状态的转换上面。
* 每次事件发生时，都会调用重绘函数，将根据每个元素的状态来重绘InspecHtmlString，展示在页面上
*/
const inspecLine_states_arr = ['open','closed','leafnode','none'];

/**给整个HTML页面里的tag进行levelize, 函数编译HTML字符串，然后以数组形式返回处理过的HTMLALLCOLLECTION对象:
*		（先处理level，因为要规定HTML显示的内容）该元素处于DOM树的第几层上，就赋予第几层的数值。 
*  输入：网页HTML源代码
*  返回：编译好的ELement的HTML元素数组
*/  
function getCompliedLevelizedHTMLTagElementsArray( htmlString ){  
	if( typeof htmlString != 'string'){
		error();
	} 

	var parser = new DOMParser();
	htmlDoc = parser.parseFromString(htmlString, "text/html");  
	let root = htmlDoc.all[0]; //root is <HTML>

	//若root结点的标签名不是HTML，或者root结点的个数多于1个->错误
	if(root.tagName != "HTML" || htmlDoc.childNodes.length != 1){
		error();
	} 
	
	root.level 			= 0; 		// initialize the level for 'HTML'-> 0 
	root.isLeafnode 	= false; 	// initialize the isLeafnode for 'html' element.
	root.style.display 	= "block"; 	// initialize the isExpand for 'html' element.
	let htmlDocArr = Array.prototype.slice.call(htmlDoc.all,0); // 将类数组HTMLALLCOLLECTION转换为ARRAY
	let docLength = htmlDocArr.length;//HTML页面内所有tag的个数  
	let i = 1;  
	while(i < docLength){
		//前序遍历的规律：后一个节点的level永远等于其父亲节点的level + 1；
		htmlDocArr[i].level = htmlDocArr[i].parentElement.level + 1; 
		
		if (htmlDocArr[i].childElementCount) {
			// if this is not a leaf node
			htmlDocArr[i].isLeafnode	= false ; 
		} else {
			htmlDocArr[i].isLeafnode	= true;
		}
		i++;
	}

	//TODO: delete this paragra: ----------Print------------
	var s='';
	for(var ins = 0; ins < htmlDocArr.length - 1;ins++){ 
		s += htmlDocArr[ins].level+", "; 
	}	s += htmlDocArr[htmlDocArr.length-1].level;
	console.log(s); 
	//-----------End Print--------- 
	return htmlDocArr;
}

var htmlDocArr_ = getCompliedLevelizedHTMLTagElementsArray(document.documentElement.outerHTML)

/****这里是用来变Inpector里HTMLTag颜色的code
*	输入：HTML网页数组
*	输出：添加过CSS样式的HTML代码，也就是Inspector的HTML代码，可以直接在HTML页面上展示 。
*/	
function buildInspectorHtmlString(htmlDocArr) {
		var htmlstring = '';
		htmlDocArr.forEach( function(item){ //这里必须是item->代表当前元素
			//div
			htmlstring += '<div class="inspecLine" tabindex="1">';
			//space
			for (let i=0; i<item.level; i++) {
				htmlstring += "&nbsp;"; 
			}
			//tagname
			htmlstring += '<<span class="inspecTagName">';
			htmlstring += item.tagName.toLocaleLowerCase();
			htmlstring += '</span>';
			//attributes 
			let attrsArr = [...item.attributes];
			for(let i=0; i<attrsArr.length; i++){
				//attributes name
				htmlstring += ' <span class="inspecAttrName">';
				htmlstring += attrsArr[i].name;
				htmlstring += '</span>';
				//'='
				htmlstring += '=';
				//attributes value
				htmlstring += '<span class="inspecAttrValue">';
				htmlstring += '"'+attrsArr[i].value+'"';
				htmlstring += '</span>';
			} 
			htmlstring += '>';
			htmlstring += '</div>';
		});
		return htmlstring ;
	}
var htmlInspectorStr = buildInspectorHtmlString(htmlDocArr_) ;
document.getElementById('displayBoard').innerHTML = htmlInspectorStr;



/****这里是用来变Inpector里HTMLTag颜色的code
*	输入：HTML网页数组
*	输出：添加过CSS样式的HTML代码，也就是Inspector的HTML代码，可以直接在HTML页面上展示 。
*/	

/**初始化 Inspector所有的Div DOM元素的状态：赋值 {open,closed,leafnode,none}
*/
function getInitedInspecHtmlDivDomsArr(htmlInspectorStr){
	//方法一：直接从获取到的HTML字符串里编译 new DOMParser().parseFromString(htmlInspectorStr,"text/html");
	//方法二：从显示这些div的地方获取其所有子节点： #displayBoard //[...document.getElementById('displayBoard').children]; 
	//直接获取所有的inspecLine类的元素
	let inspecHtmlDivDomsArr = [...document.getElementsByClassName("inspecLine")];
	inspecHtmlDivDomsArr.forEach(function(item){
		if (item.children[0].innerText == 'html') {
			item.state = 'open';
			item.isExpand = true;
		} else if (item.children[0].innerText == 'head') {
			item.state = 'closed';
			item.isExpand = false;
		} else if (item.children[0].innerText == 'body') {
			item.state = 'closed';
			item.isExpand = false;
		} else {
			item.state = 'none';
			item.isExpand = false;			
		}
	}); 
	for (let i = 0; i < inspecHtmlDivDomsArr.length; i++) {
		inspecHtmlDivDomsArr[i].isLeafnode = htmlDocArr_[i].isLeafnode ? true: false; 
	} 
	return inspecHtmlDivDomsArr;
}

var inspecHtmlDivDomsArr_ = getInitedInspecHtmlDivDomsArr( /* htmlInspectorStr */ );
  
/*** bind Eventhandlers with Inspec-Lines 
* 	将onclick，onblur，ondblclick与所有inspector的div进行事件绑定
* void
* void
* 	onclick		： 点击时内部字体全部变为#FFF色
*	onblur		： 离开时，内部字体颜色恢复
*	ondblclick	： 展开/合并 此标签内所有元素 
*/
function bindEventOnInspecLines (inspecHtmlDivDomsArr){ 
	//获取文档中所有class为inspecLine的标签
	var inspecLineCollection = inspecHtmlDivDomsArr ? inspecHtmlDivDomsArr : document.getElementsByClassName("inspecLine") ; 
	for( let i=0; i<inspecLineCollection.length; i++){		 
		let dom = inspecLineCollection[i];
		//绑定点击变化（由css设定到白色）事件
		dom.onmousedown = function(e){
			childrenDoms = dom.children;
			for(let j = 0 ; j < childrenDoms.length; j++){  
			  if (childrenDoms[j].style.color  == "rgb(255, 255, 255)" || childrenDoms[j].style.color == "#FFF") {	//inspecLine已经被选择时候再点击
				// do nothing 
			  } else {									//inspecLine第一次被选择
				childrenDoms[j].oldColor = childrenDoms[j].style.color ;
			  }  
			  childrenDoms[j].style.color = "#FFF";
			}
			sparkHtmlDomBoard(e);
		} 	
		//绑定点击变化事件：当焦点从被点击的上面移开时候，恢复原有颜色
		dom.onblur = function(){
			childrenDoms = dom.children;
			for(let j = 0 ; j < childrenDoms.length; j++){ 
			  childrenDoms[j].style.color = childrenDoms[j].oldColor;
			}
		}  
	/*** 当双击Inspec-lines用户时候: {收起|展开}子元素 ***/
		dom.ondblclick = function(){
			if (dom.isLeafnode){
				//do nothing
			} else if (dom.isExpand) { //is Expanding-> to do close 
				dom.state = 'closed'
				dom.isExpand = false;
				drawInspecHtmlDivDomStyle(dom); 
			} else if (!dom.isExpand) {//if(dom.isExpand == false) -> is closing-> to do expand 
			    dom.state = 'open'
				dom.isExpand = true;
				drawInspecHtmlDivDomStyle(dom); 
			} else {
				alert("error! " + dom);
				error();
			}
		};
	}
	//用户在HTMLInspector上点击鼠标（onmousedown），HTML页面里显示该元素，添加一个board的CSS属性。
	function sparkHtmlDomBoard(e) {
		let ev = e || window.event;	//这里的e不能写成event，尽管形参为event(因为这里的event是window.event：上一层作用域的event)
		let divdom = ev.target||ev.srcElement; //获取到DivDom目标
		let realHtmlDocDom = getRealHtmlDocDomViaHtmlDocDom(divdom);
		/** notice! 这里可以简单地重构一下 */
		var edgeBorderStyle = "2px solid blue";
		realHtmlDocDom.style.border = edgeBorderStyle;
	}
}

//用户点击屏幕的HTML元素，从而在HTMLInspector上显示该元素
//绑定页面元素
function locateDomViaWebPage( e ){
	let ev = e || window.event;	//这里的e不能写成event，尽管形参为event(因为这里的event是window.event：上一层作用域的event)
	let target   = ev.target||ev.srcElement; //获取到点击目标
	let shortestPathArr = getShortestBubbleUpPathArr(target);
	shortestPathArr.forEach(function(item){ /**notice! *注意* 是从下向上遍历方向 要是出问题的话，可以逆向地去执行这个函数*/
		if (target == item){ 
			if (true == target.isLeafnode) {///notice: 这里为做判断是因为为了四个状态不发生冲突
				addClassvalueOn(target,"inspecLeafnodeLine");
			} else{
				item.isExpand = false; 
			}
		} else {
			item.isExpand = true;
		} 
	});
	drawInspecHtmlDivDomStyle(target);
} 

bindEventOnInspecLines();

	
//这里的dom就是div dom
function drawInspecHtmlDivDomStyle(dom){
	switch (dom.state) {
		
	  case 'open': {
		removeClassvalueOn(dom, "inspecNoneLine", "inspecExtenableLine_closed");			///notice: dom.classList.remove("inspecNoneLine");
		addClassvalueOn(dom, "inspecExtenableLine_open");	///notice: dom.classList.add("inspecExtenableLine_open")
		/***notice:这里要注意!不能用.children获取所有孩子结点，尽管看着是孩子结点，但是在DivDOM里表示出来的实践是兄弟结点*/
		let temp_domChildsArr = getIndexOfChildrenDomsArr(dom); 
		for (let i = 0; i < temp_domChildsArr.length; i++) {
			let tempDivDom = inspecHtmlDivDomsArr_[temp_domChildsArr[i]];
			if (tempDivDom.isLeafnode) { ///notice: inspecHtmlDivDomsArr_是个var! 注意定义!
				tempDivDom.state = 'leafnode';
			} else {// other 3 kinds of states
				tempDivDom.state = 'closed';
			}
			drawInspecHtmlDivDomStyle(tempDivDom);
			console.log(tempDivDom);
		} 
		break;
	  }
	  
	  case 'closed':{
		removeClassvalueOn(dom, "inspecNoneLine", "inspecExtenableLine_open" );
		addClassvalueOn(dom, "inspecExtenableLine_closed"); 
		/***notice:这里要注意!不能用.children获取所有孩子结点，尽管看着是孩子结点，但是在DivDOM里表示出来的实践是兄弟结点*/
		let temp_domChildsArr = getIndexOfChildrenDomsArr(dom); 
		for (let i = 0; i < temp_domChildsArr.length; i++) { 
			let tempDivDom = inspecHtmlDivDomsArr_[temp_domChildsArr[i]];
			tempDivDom.state = 'none';  
			drawInspecHtmlDivDomStyle(tempDivDom);
			console.log(tempDivDom);
		}
		break;
	  }	
	  
	  case 'leafnode':{
		removeClassvalueOn(dom,"inspecNoneLine");
		addClassvalueOn(dom, "inspecLeafnodeLine"); 
		break;  
	  }		
	  
	  case 'none':{
		let realHtmlDocSiblingDom = getHtmlDocDomViaDivDom(dom).nextElementSibling;
		let siblingDomIndex = getDomIndexFromRealHtmlDocArr(realHtmlDocSiblingDom);    ///notice: siblingDomIndex即是 inspecHtmlDivDomsArr_ 的也是htmlDocArr_的
		let currentDomIndex = inspecHtmlDivDomsArr_.indexOf(dom);
		let i = currentDomIndex;
		while (i < siblingDomIndex ) { 			//按照前序遍历，从该结点到下一兄弟结点的所有结点都是子结点 
			if (!inspecHtmlDivDomsArr_[i].isLeafnode) {
				inspecHtmlDivDomsArr_[i].isExpand = false
			}
			addClassvalueOn(inspecHtmlDivDomsArr_[i++], "inspecNoneLine");  
		} 
		if (siblingDomIndex == -1) {//This node is 'the last child'-> no sibling element
			if (!dom.isLeafnode) {
				dom.isExpand = false;
				dom.state = 'closed';
				drawInspecHtmlDivDomStyle(dom);
			}
			addClassvalueOn(dom, "inspecNoneLine");  
		}
		break;
	  }	
	  
	  default:
		alert(""+dom);
		error(); 
	} 
	
} 

function drawAllInspecHtmlDivDoms(inspecHtmlDivDomsArr){	//state machine transientor
	var inspecHtmlDivDomsArr = inspecHtmlDivDomsArr ? inspecHtmlDivDomsArr : inspecHtmlDivDomsArr_;
	inspecHtmlDivDomsArr.forEach(function(item){
		drawInspecHtmlDivDomStyle(item);
	});	
}

//这里是实现两个对应：DivDOM和真实的HTMLDocDOM对应起来
function getIndexOfChildrenDomsArr(dom, htmlDocArr_in, inspecHtmlDivDomsArr_in){
	let htmlDocArr = htmlDocArr_in ? htmlDocArr_in : htmlDocArr_;
	let inspecHtmlDivDomsArr_temp = inspecHtmlDivDomsArr_in ? inspecHtmlDivDomsArr_in : inspecHtmlDivDomsArr_;

	let domIndex = inspecHtmlDivDomsArr_temp.indexOf(dom);
	let childrenDomsArr = [...htmlDocArr[domIndex].children];
	let childrenDomsIndexArr = [];	
	
	childrenDomsArr.forEach(function(item){
		childrenDomsIndexArr.push(htmlDocArr.indexOf(item));
	})
	return childrenDomsIndexArr.sort();
}

/** show Inspector */
drawInspecHtmlDivDomStyle(inspecHtmlDivDomsArr_[0]);
//drawAllInspecHtmlDivDoms(inspecHtmlDivDomsArr_);



/***在元素为displayBoard的标签里展示inspector
* 输入：inspector的HTML源码
* 返回：void
*/ 
function showInspector(inspectorHtmlString) {
	var bcd = document.getElementById('displayBoard');
	bcd.innerHTML = inspectorHtmlString;
} 

function getHtmlDocDomViaDivDom(divDom){
	let index = inspecHtmlDivDomsArr_.indexOf(divDom);
	return htmlDocArr_[index]; 
}

/** 这个函数要放在源HTML文件,用于跨域通信时调用，不能放iframe.HTML里  
*	获取页面上的真正的dom元素，而不是被编译过的字符串
*//** TODO: 重构！ */
function getRealHtmlDocDomViaHtmlDocDom(htmlDocDom) { 
	var documentAllArr = [...document.all];
	let displayBoard = document.getElementById("displayBoard");
	let i_stop = documentAllArr.indexOf(displayBoard);
	let i_restart = documentAllArr.indexOf(displayBoard.nextElementSibling);
	let i = htmlDocArr_.indexOf(htmlDocDom);
	i = i < i_stop ? i :  (i_restart - i_stop) + i;
	return documentAllArr[i];
}

function getDivDomViahtmlDocDom(htmlDocDom){
	let index = htmlDocArr_.indexOf(htmlDocDom);
	return inspecHtmlDivDomsArr_[index]; 
}

function getDomIndexFromRealHtmlDocArr(dom){
	return htmlDocArr_.indexOf(dom);
}
 
 
/************************** notice: !!这一部分的代码是有问题的!*不能使用dom直接获取最短路径！*********************************/
/*** Bubble Up until HTML Tag 最短路径找到HTML的算法
* input	: any specific real Html Document Dom element on the HTML document
* return: the array made from the elements in shortest path from html to the cooresponding dom element 
**/ 
function getShortestBubbleUpPathArr(htmlDocDom) { //参数应该是realHtmlDocDom?
	let currentDom = htmlDocDom, shortestPathArr = [];
	while (currentDom != null) {
		shortestPathArr.push(currentDom);
		currentDom = currentDom.parentElement;
	}
	return shortestPathArr;
}

/** 在某HTML标签元素-dom上，进行添加class属性的值，值可以重复添加->有去重功能
*/
function addClassvalueOn(dom, ...newClassAttrs){//可变参数，只有dom是必须：newClassAttrs是当做数组处理的
	// i is index of each element in array 'newClassAttrs'
	for( let i in newClassAttrs) { 
		//Check if all element in newClassAttrs is string type, if not: throw error and stop
		if (typeof newClassAttrs[i] != 'string') {
			if (i != 'contain') {
				throw err = new Error( 'all new class value should be "string" type!' );  
			} 
		}
	}
	let oldClassAttrs = dom.attributes["class"] ? dom.attributes["class"].value.trim().split(' ') : "" ; 
	unionClassvalueSet = new Set([...newClassAttrs, ...oldClassAttrs]);//合并两个集合 
	let newClassAttrsString = [...unionClassvalueSet].join(' '); //...先由Set转化为Array,再用join()转化为字符串
	dom.setAttribute("class", newClassAttrsString.trim()); 
}

/** 在某HTML标签元素-dom上，减少添加class属性的值 */
function removeClassvalueOn(dom, ...newClassAttrs){  
	for( let i in newClassAttrs) {  
		if (typeof newClassAttrs[i] != 'string') {
			if (i != 'contain') {
				throw err = new Error( 'all new class value should be "string" type!' );  
			} 
		}
	}   
	let oldClassAttrs = dom.attributes["class"] ? dom.attributes["class"].value.trim().split(' ') : "" ; 
	let newClassAttrsSet = new Set(newClassAttrs);
	let differenceClassvalueSet = new Set([...oldClassAttrs].filter( (x) => { 							// 两个集合 old - new
																	return ! newClassAttrsSet.has(x);  // 如果新的数组里有这个元素，就返回false, 返回值为false就移除。
															   }));   
	let newClassAttrsString = [...differenceClassvalueSet].join(' '); //...先由Set转化为Array,再用join()转化为字符串
	dom.setAttribute("class", newClassAttrsString.trim()); 
}

