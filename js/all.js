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
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`).then(function(response){
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

    axios.post("https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/hexoschool/carts",{
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
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).then(function(response){
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

cartList.addEventListener('click',function(e){
    e.preventDefault();
    console.log(e.target);
    const cartId = e.target.getAttribute("data-id");
    if(cartId==null){
        alert("點到其他東西了");
        return;
    }
    console.log(cartId);
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`).then(function(response){
        alert("刪除單筆購物車成功");
        getCartList();
    })
})