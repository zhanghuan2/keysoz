window.priceFormat = (price, bit) => {
  bit = bit || 2;
  if (typeof(price) === "string" && price !== "") {
    return (parseFloat(price) / 100).toFixed(bit);
  } else if (typeof(price) === "number" && price !== NaN) {
    return parseFloat(price / 100).toFixed(bit);
  } else {
    return price;
  }
}

window.centFormat = (price) => {
  if (typeof(price) === "string" && price !== "") {
    return parseInt((parseFloat(price) * 100).toFixed());
  } else if (typeof(price) === "number" && price !== NaN) {
    return (parseInt((price * 100).toFixed()));
  } else {
    return price;
  }
}
