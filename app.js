//BUDGET CONTROLLER
var budgetController=(function(){
  var Expenses=function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
    this.percentage=-1;
  };

  Expenses.prototype.calcPercentages=function(totalIncome){
    if(totalIncome>0)
    {
      this.percentage=Math.round((this.value/totalIncome)*100);
    }
    else {
      this.percentage=-1;
    }
  };

  Expenses.prototype.getPercentage=function(){
    return this.percentage;

  };

  var Incomes=function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
  };

  var calculateTotal=function(type){
    var sum=0;
    data.allItems[type].forEach(function(cur){
      sum+=cur.value;
    });
    data.totals[type]=sum;

  };

  var data={
    allItems:{
      exp:[],
      inc:[]
    },
    totals:{
      exp:0,
      inc:0
    },
    budget:0,
    percentage:-1
  };



  return {
    addItem: function(type,des,value){
      var newItem,ID;
      //Create new idea
      if(data.allItems[type].length>0){
      ID=data.allItems[type][data.allItems[type].length-1].id+1;
    }
      else {
        ID=0;
      }
      //Create new item based on type
      if(type==='exp')
      {
        newItem= new Expenses(ID,des,value);
      }else if(type==='inc')
      {
        newItem= new Incomes(ID,des,value);
      }

      //Push the newItem into our data based on type
        data.allItems[type].push(newItem);

      //Return newItem
        return newItem;

    },


    deleteItem: function(type,id)
    {
      var ids,index;
      ids=data.allItems[type].map(function(current){
        return current.id;
      });

      index=ids.indexOf(id);

      if(index!==-1){
        data.allItems[type].splice(index,1);
      }

    },

    calculateBudget: function(){
      //Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //Calculate the budget
      data.budget=data.totals['inc']-data.totals['exp'];

      //Calculate percentage of income that we spent
      if(data.totals['inc']>0){
        data.percentage=Math.round((data.totals.exp*100)/data.totals.inc);
      }
      else {
        data.percentage=-1;
      }

    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function(){
      var allPerc=data.allItems.exp.map(function(cur){
          return cur.getPercentage();
      });
      return allPerc;
    },



  getBudget: function () {
    return{
      budget:data.budget,
      getInc:data.totals.inc,
      getExp:data.totals.exp,
      percentage:data.percentage

    };
  }



}})();

//UI CONTROLLER
var UIController=(function(){

  var DOMStrings={
    inputType: '.add__type',
    inputDescription:'.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel:'.budget__title--month'
  };

  var formatNumber=function (num,type) {
    var numSplit,int,dec;
    num=Math.abs(num);
    num=num.toFixed(2);
    numSplit=num.split('.');
    int=numSplit[0];
    if(int.length>3)
    {
      int=int.substr(0,int.length-3)+','+int.substr(int.length-3,int.length);
    }
    dec=numSplit[1];
    return (type==='exp'?'-':'+')+' '+int+'.'+dec;

};

var nodeListForEach=function(list,callback){
  for(var i=0;i<list.length;i++)
  {
    callback(list[i],i);
  };
}


  return {
    getInput: function(){
      return{
        type: document.querySelector(DOMStrings.inputType).value,  //will be inc or exp;
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };

    },

    addListItem: function(obj,type){
      var html,newHtml,element;
      //Create HTML string with placeholder text
      if(type==='inc'){
      element=DOMStrings.incomeContainer;
      html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      else if(type==='exp'){
      element=DOMStrings.expensesContainer;
      html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace placeholder text with actual data
      newHtml=html.replace('%id%',obj.id);
      newHtml=newHtml.replace('%description%',obj.description);
      newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));


      //Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

    },

    deleteListItem: function(selectorID)
    {
      var el=document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function(){
      var fields,fieldsArr;
      fields=document.querySelectorAll(DOMStrings.inputDescription+','+DOMStrings.inputValue);
      //Now we want to convert fields which is a list into an array to use foreach
      //So we use the call technique to set the this object to fields and use an array function slice which returns an array using a list
      fieldsArr=Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current,index,array){
        //three default arguments
        current.value="";
      });
      fieldsArr[0].focus();

    },

    displayBudget: function(obj){
      var type;
      obj.budget>=0?type='inc':type='exp';
      document.querySelector(DOMStrings.budgetLabel).textContent=formatNumber(obj.budget,type);
      document.querySelector(DOMStrings.incomeLabel).textContent=formatNumber(obj.getInc,'inc');
      document.querySelector(DOMStrings.expenseLabel).textContent=formatNumber(obj.getExp,'exp');
      if(obj.percentage>0){
        document.querySelector(DOMStrings.percentageLabel).textContent=obj.percentage+'%';
      }
      else {
        document.querySelector(DOMStrings.percentageLabel).textContent='---';
      }


    },

    displayPercentages: function(percentages){
      var fields=document.querySelectorAll(DOMStrings.expensesPercLabel);


         nodeListForEach(fields,function(current,index){
          if(percentages[index]>0)
          {
            current.textContent=percentages[index]+'%';
          }
          else {
            current.textContent='---';
          }
        });




    },

    displayMonth: function(){
      var now,month,months,year;
      now=new Date();
      months=['January','February','March','April','May','June','July','August','September','October','November','December'];
      month=now.getMonth();
      year=now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent=months[month]+' '+year;
    },

    changedType:function(){
      var fields=document.querySelectorAll(DOMStrings.inputType+','+DOMStrings.inputDescription+','+DOMStrings.inputValue);
      nodeListForEach(fields,function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    getDOMStrings: function(){
      return DOMStrings;
    }
  };



})();

//GLOBAL CONTROLLER that links both
var controller=(function(bdtctrl,UIctrl){

  var setupEventListeners=function(){
    var DOM=UIController.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

    document.addEventListener('keypress',function(event){
      if(event.keyCode===13||event.which===13)
      {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change',UIController.changedType);
  };


var updateBudget=function(){
  //1.Calculate budget
  budgetController.calculateBudget();
  //2.Return budget
  var budget=budgetController.getBudget();
  //3.Update the UI
  UIController.displayBudget(budget);
};

var updatePercentages=function(){
  //1.Calculate the percentages
  budgetController.calculatePercentages();
  //2.Read percentages from budgetController
  var percentages=budgetController.getPercentages();

  //3.Update the UI
  UIController.displayPercentages(percentages);
};

  var ctrlAddItem=function(){
    //1. Read the input
    var input=UIController.getInput();
    console.log(input);

    if(input.description!==""&&!isNaN(input.value)&&input.value>0){
    //2.Add item to budgetController
    var newItem=budgetController.addItem(input.type,input.description,input.value);
    //3.Add item to UIController
    UIController.addListItem(newItem,input.type);
    //4.Clearing input fields
    UIController.clearFields();
    //5.Calculate and update budget
    updateBudget();
    //6.Calculate and update percentages
    updatePercentages();

  }


  };

  var ctrlDeleteItem=function(event){
    var itemID,splitID,type,ID;
    itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitID=itemID.split('-');
    type=splitID[0];
    ID=parseInt(splitID[1]);

    //1.delete item from data structure
    budgetController.deleteItem(type,ID);
    //2.update the UI
    UIController.deleteListItem(itemID);
    //3.update and show the new budget
    updateBudget();
    //4.Calculate and update percentages
    updatePercentages();
  };

  return {
     init: function(){
      console.log('Application has started');
      UIController.displayMonth();
      UIController.displayBudget(
        {
          budget:0,
          getInc:0,
          getExp:0,
          percentage:-1

        }
      );
      setupEventListeners();
    }
  };




})(budgetController,UIController);

controller.init();
