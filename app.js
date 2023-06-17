let sellList = [],
    basketList = [];

toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toast-top-center",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
};
// basket modalı açma kapama
const toggleModal = () => {
    const basketModalEl = document.querySelector(".basket_modal");
    basketModalEl.classList.toggle("active");
};


const getItems = () => {
    fetch("./api.json")
        .then((res) => res.json())
        .then((items) => (sellList = items));
};

getItems();
// star derece için döngü
// const createSellStars = (starRate) => {
//     let starRateHtml = "";
//     for (let i = 1; i <= 5; i++) {
//         if (Math.round(starRate) >= i)
//             starRateHtml += `<i class="bi bi-star-fill active"></i>`;
//         else starRateHtml += `<i class="bi bi-star-fill"></i>`;
//     }

//     return starRateHtml;
// };

const createSellItemsHtml = () => {
    const sellListEl = document.querySelector(".sell_list");
    let sellListHtml = "";
    sellList.forEach((sell, index) => {
        sellListHtml += `
        <div class="col-3 sell_card ${index % 2 == 0 && "offset-2"}">
            <div class="sell_card-img ">
                <img class="img-fluid shadow" src="${sell.image}" width="258" height="400" />
            </div>
            <div class="sell_detail">
                    <span class="fos gray">${sell.title}</span><br />
                    <span class="fw-light gray-info">${sell.category}</span><br />
                    <div class="sell_star-rate">
                        <span><i class="bi bi-star-fill"></i>${sell.rating.rate}</span>
                        <span><i class="bi bi-bag-fill"></i> ${sell.rating.count} </span>
                    </div>
            </div>
            <p class="sell_description fos gray">
            ${sell.description}
            </p>
            <div class="price">
                <span class="black fw-bold fs-4"><i class="bi bi-tag"></i> ${sell.price} $</span>
                ${sell.oldPrice
                    ? `<span class="old_price"><i class="bi bi-file-arrow-down"></i> ${sell.oldPrice} $</span>`
                    : ""
                }
            </div>
            <button class="btn btn-purple" onclick="addSellToBasket(${sell.id})" >Buy Now</button>
        </div>`;
    });

    sellListEl.innerHTML = sellListHtml;
};

const SELL_TYPES = {
    ALL: "ALL",
    "men's clothing" : "Men",
    "women's clothing" : "Women",
    "jewelery" :"Jewellery",
    "electronics" : "Tecnology",
};

const createSellTypesHtml = () => {
    const filterEl = document.querySelector(".filter");
    let filterHtml = "";
    let filterTypes = ["ALL"];
    sellList.forEach((sell) => {
        if (filterTypes.findIndex((filter) => filter == sell.category) == -1)
            filterTypes.push(sell.category);
    });

    filterTypes.forEach((category, index) => {
        filterHtml += `<li class="${index == 0 ? "active" : null
            }" onclick="filterItems(this)" data-category="${category}">${SELL_TYPES[category] || category
            }</li>`;
    });

    filterEl.innerHTML = filterHtml;
};

const filterItems= (filterEl) => {
    document.querySelector(".filter .active").classList.remove("active");
    filterEl.classList.add("active");
    let sellType = filterEl.dataset.category;
    getItems();
    if (sellType != "ALL")
        sellList = sellList.filter((sell) => sell.category == sellType);
    createSellItemsHtml();
};

const listBasketItems = () => {
    localStorage.setItem("basketList", JSON.stringify(basketList));
    const basketListEl = document.querySelector(".basket_list");
    const basketCountEl = document.querySelector(".basket_count");
    basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
    const totalPriceEl = document.querySelector(".total_price");

    let basketListHtml = "";
    let totalPrice = 0;
    basketList.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
        basketListHtml += `
        <li class="basket_item">
        <img
          src="${item.product.image}"
          width="100"
          height="100"
        />
        <div class="basket_item-info">
          <h3 class="sell_name">${item.product.title}</h3>
          <span class="sell_price">${item.product.price}₺</span><br />
          <span class="sell_remove" onclick="removeItemToBasket(${item.product.id})"></span>
        </div>
        <div class="sell_count">
          <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span>
          <span class="my-5 fs-5 f-bold">${item.quantity}</span>
          <span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
        </div>
      </li>`;
    });

    basketListEl.innerHTML = basketListHtml
        ? basketListHtml
        : `<li class="basket_item">No items to Buy again.</li>`;
    totalPriceEl.innerHTML =
        totalPrice > 0 ? "Total : " + totalPrice.toFixed(2) + "$" : null;
};

const addSellToBasket = (sellId) => {
    let findedSell = sellList.find((sell) => sell.id == sellId);
    if (findedSell) {
        const basketAlreadyIndex = basketList.findIndex(
            (basket) => basket.product.id ==sellId
        );
        
        if (basketAlreadyIndex == -1) {
            let addedItem = { quantity: 1, product: findedSell };
            basketList.push(addedItem);

        } else {
            if (
                basketList[basketAlreadyIndex].quantity <
                basketList[basketAlreadyIndex].product.rating.count
            )
                basketList[basketAlreadyIndex].quantity += 1;    
            else {
                toastr.error("Sorry, we don't have enough stock.");
                return;
            }
        }
        listBasketItems();
        toastr.success("Product has been added to the basket.");
    }
};

const removeItemToBasket = (sellId) => {
    const findedIndex = basketList.findIndex(
        (basket) => basket.product.id == sellId
    );
    if (findedIndex != -1) {
        basketList.splice(findedIndex, 1);
        toastr.error("Product in cart you deleted.");
    }
    listBasketItems();
    toastr.error("Sorry, we don't have enough stock.");
    
};

const decreaseItemToBasket = (sellId) => {
    const findedIndex = basketList.findIndex(
        (basket) => basket.product.id == sellId
    );
    if (findedIndex != -1) {
        if (basketList[findedIndex].quantity != 1)
            basketList[findedIndex].quantity -= 1;
        else removeItemToBasket(sellId);
        listBasketItems();
        toastr.warning("You reduced the product");
    }
};

const increaseItemToBasket = (sellId) => {
    const findedIndex = basketList.findIndex(
      (basket) => basket.product.id == sellId
    );
    if (findedIndex != -1) {
      if (basketList[findedIndex].quantity < basketList[findedIndex].product.rating.count) {
        basketList[findedIndex].quantity += 1;
        toastr.success("Product quantity has been increased.");
      } else {
        toastr.error("Sorry, we don't have enough stock.");
      }
      listBasketItems();
    }
};

if (localStorage.getItem("basketList")) {
    basketList = JSON.parse(localStorage.getItem("basketList"));
    listBasketItems();
}

function myFunction() {
    return toastr.success("You are being redirected to the payment page. Please perform address and product verification on the incoming screen.");
}

// Butonun referansını alın
const closeButton = document.querySelector('.basket_items .bi-x');

// Body üzerinde tıklama olayını dinleyin
document.body.addEventListener('click', function(event) {
  // Eğer tıklanan element butonun kendisi veya bir çocuğu ise, işlem yapmayın
  if (event.target === closeButton || closeButton.contains(event.target)) {
    return;
  }
  
  // Tıklama olayı butondan kaynaklanmıyorsa, butonu kapatın
//   closeButton.style.display = 'none';
});



setTimeout(() => {
    createSellItemsHtml();
    createSellTypesHtml();
}, 100);