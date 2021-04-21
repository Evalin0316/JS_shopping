let orderData = [];
const orderList = document.querySelector('.js-orderList');

function init(){
    getOrderList();
}
init();


function renderC3(){
    console.log(orderData);

    //object collection data
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]=== undefined){
                total[productItem.category] = productItem.price*productItem.quantity;
            }else{
                total[productItem.category] += productItem.price*productItem.quantity;
            }
        })
    })

    console.log(total);

    let categoryAry = Object.keys(total);
    console.log(categoryAry);
    let newData = [];
    categoryAry.forEach(function(item){
        let ary =[];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })

    console.log(newData);



    //C3.js
    let chart = c3.generate({
        bindto: '#chart',
        data:{
            type: "pie",
            colums: newData,
        },
    });
}

function renderC3_data(){
    let obj ={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title] === undefined){
                obj[productItem.title] = productItem.quantity * productItem.price;
            }else{
                obj[productItem.title]+= productItem.quantity * productItem.price;
            }
        })
    });
    console.log(obj);


    // 資料關聯
    let originAry = Object.keys(obj);
    console.log(originAry);
     
    
    let rankSortAry = []; 
    originAry.forEach(function(item){
        let ary =[];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });
    console.log(rankSortAry);
    rankSortAry.sort(function(a,b){
        return b[1] - a[1];
    })
    if (rankSortAry.length > 3) {
        let otherTotal = 0;
        rankSortAry.forEach(function (item, index) {
          if (index > 2) {
            otherTotal += rankSortAry[index][1];
          }
        })
        rankSortAry.splice(3, rankSortAry.length - 1);
        rankSortAry.push(['其他', otherTotal]);
        
      }
      // 超過三筆後將第四名之後的價格加總起來放在 otherTotal
      // c3 圖表
      c3.generate({
        bindto: '#chart',
        data: {
          columns: rankSortAry,
          type: 'pie',
        },
        color: {
          pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
        }
      });
    }
    function getOrderList(){
      axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
          'Authorization':token,
        }
      })
      .then(function(response){
        orderData = response.data.orders;
        let str = '';
        orderData.forEach(function(item){
          // 組時間字串
          const timeStamp = new Date(item.createdAt*1000);
          const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
          
          // 組產品字串
          let productStr = "";
          item.products.forEach(function(productItem){
            productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
          })
        // 判斷訂單處理狀態
        let orderStatus="";
        if(item.paid==true){
          orderStatus="已處理"
        }else{
          orderStatus = "未處理"
        }
        // 組訂單字串
          str +=`<tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                ${productStr}
              </td>
              <td>${orderTime}</td>
              <td class=" js-orderStatus">
                <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
              </td>
            </tr>`
        })
        orderList.innerHTML = str;
        renderC3_data();
      })
    }
    
    orderList.addEventListener("click",function(e){
      e.preventDefault();
      const targetClass = e.target.getAttribute("class");
      let id = e.target.getAttribute("data-id");
      if (targetClass == "delSingleOrder-Btn js-orderDelete" ){
        deletOrderItem(id)
        return;
      }
      if (targetClass == "orderStatus"){
        let status = e.target.getAttribute("data-status");
        
        changeOrderStatus(status,id)
        return;
      }
    })
    
    
    function changeOrderStatus(status,id){
      console.log(status,id);
      let newStatus;
      if(status==true){
        newStatus=false;
      }else{
        newStatus=true
      }
      axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
          "id": id,
          "paid": newStatus
        }
      } ,{
        headers: {
          'Authorization': token,
        }
      })
      .then(function(reponse){
        alert("已修改訂單狀態");
        getOrderList();
      })
    }
    
    function deletOrderItem(id){
      axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
          'Authorization': token,
        }
      })
        .then(function(response){
          alert("刪除該筆訂單成功");
          getOrderList();
        })
      
    }
   
    
    //delete all order
    
    const discardAllBtn = document.querySelector(".discardAllBtn");
    discardAllBtn.addEventListener("click",function(e){
      e.preventDefault();
      axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
          'Authorization': token,
        }
      })
        .then(function (response) {
          alert("已刪除全部訂單!");
          getOrderList();
        })
    })
