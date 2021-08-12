console.log(api_path,token);

let productData =[];
let cartData = [];

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");

function init(){
    getProductList();
    getCartList();
}
init();

function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).then(function(response){
    productData = response.data.products; 
    renderProductList();   
    console.log(response);
    
    }) 
}

function combineProduct(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
</li>`

}

function renderProductList(){
    let str ="";
    productData.forEach(function(item){
        str+= combineProduct(item);
    })
    productList.innerHTML =str;
}

//product Selector 
productSelect.addEventListener('change', function(e){
    // console.log(e.target.value);
    const category = e.target.value;
    if(category==="全部"){
        renderProductList();
        return; //終止不跑其他的
    }

    let str = "";
    productData.forEach(function(item){
        if(category === item.category) {
            str+= combineProduct(item);
        }
    })
    productList.innerHTML =str;

})

//add to cart
productList.addEventListener("click", function(e){
    
    e.preventDefault(); //取消預設行為
    console.log(e.target.getAttribute("data-id"));
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !=="js-addCart") {
        return;
    }
    let productId = e.target.getAttribute("data-id");
    console.log(productId);

    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity+=1;
        }
    })
    console.log(numCheck);

    axios.post("https://livejs-api.hexschool.io/api/livejs/v1/customer/hexoschool/carts",{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }
    }).then(function(response){
        console.log(response);
        alert("加入購物車");
        getCartList();
    })
})

function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
      document.querySelector(".js-total").textContent= toThousands(response.data.finalTotal);
    cartData = response.data.carts;
    let str ="";
    cartData.forEach(function(item){
        str+=`<tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="">
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.price * item.quantity}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
            clear
          </a>
        </td>
      </tr>`
    });
    
    cartList.innerHTML = str;
})
}

// delete
cartList.addEventListener('click',function(e){
    e.preventDefault();
    console.log(e.target);
    const cartId = e.target.getAttribute("data-id");
    if(cartId==null){
        alert("點到其他東西了");
        return;
    }
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).then(function(response){
        alert("刪除單筆購物車成功");
        getCartList();
    })
})


// delete All
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(response){
    alert("刪除購物車全品項成功！");
    getCartList();
  })
  .catch(function(response){
    alert("購物車已清空，請勿重複點擊")
  })
})



//send order

const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
  e.preventDefault();
  if(cartData.length ==0){
    alert("請加入商品至購物車");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;
  if (customerName==""|| customerPhone==""|| customerEmail==""|| customerAddress==""|| customerTradeWay==""){
    alert("請勿輸入空資訊!!");
    return;
  }
  if (validateEmail(customerEmail)==false){
    alert("請填寫正確的Email格式~~~");
    return;
  }
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }).then(function(response){
    alert("訂單建立成功");
     document.querySelector("#customerName").value="";
     document.querySelector("#customerPhone").value="";
     document.querySelector("#customerEmail").value="";
     document.querySelector("#customerAddress").value="";
     document.querySelector("#tradeWay").value="ATM";
    getCartList();
  })
})


const customerEmail = document.querySelector("#customerEmail");
const customerPhone = document.querySelector("#customerPhone");
customerEmail.addEventListener("blur",function(e){
  if (validateEmail(customerEmail.value) == false) {
    document.querySelector(`[data-message=Email]`).textContent = "請填寫正確 Email 格式";
    return;
  } 
});

customerPhone.addEventListener("blur",function(e){
  if (validatePhone(customerPhone.value) == false) {
    document.querySelector(`[data-message=電話]`).textContent = "請填寫正確電話格式";
    return;
  }
})


// util js、元件
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  
  function validateEmail(mail) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
      return true
    }
    return false;
  }
  function validatePhone(phone) {
    if (/^[09]{2}\d{8}$/.test(phone)) {
      return true
    }
    return false;
  }
  

  const themeSwitcher = document.getElementById("theme-switch");

themeSwitcher.checked = false;
function clickHandler() {
    if (this.checked) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.add("light");
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
}
themeSwitcher.addEventListener("click", clickHandler);

window.onload = checkTheme();

function checkTheme() {
    const localStorageTheme = localStorage.getItem("theme");

    if (localStorageTheme !== null && localStorageTheme === "dark") {
        // set the theme of body
        document.body.className = localStorageTheme;

        // adjust the slider position
        const themeSwitch = document.getElementById("theme-switch");
        themeSwitch.checked = true;
    }
}