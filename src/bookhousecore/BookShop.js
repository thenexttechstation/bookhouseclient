import React, { useState, useEffect } from "react";
import BookhouseLayout from "./BookhouseLayout";
import BookShopCard from "./BookShopCard";
import {
  getcategories,
  getFilteredProducts
} from "../bookhousecore/BookHouseAPICore";
import CategoryCheckbox from "./CategoryCheckBox";
import PriceRadioBox from "./PriceRadioBox";
import { prices } from "./fixedPrices";
import Carousal from "../bookhousecore/Carousal";
import Fab from "@material-ui/core/Fab";
import NavigationIcon from "@material-ui/icons/Navigation";
import { makeStyles } from "@material-ui/core/styles";

const BookShop = () => {
  const [myFilters, setMyFilters] = useState({
    filters: { bookhousecategory: [], price: [] }
  });
  const [bookhousecategories, setbookhouseCategories] = useState([]);
  const [error, setError] = useState(false);
  const [limit, setLimit] = useState(6);
  const [skip, setSkip] = useState(0);
  const [size, setSize] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);

  const init = () => {
    getcategories().then(data => {
      console.log("getcategories" + JSON.stringify(data));
      if (data.error) {
        setError(data.error);
      } else {
        setbookhouseCategories(data);
      }
    });
  };

  const loadFilteredResults = newFilters => {
    // console.log(newFilters);
    getFilteredProducts(skip, limit, newFilters).then(data => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults(data.data);
        setSize(data.size);
        setSkip(0);
      }
    });
  };
  const useStyles = makeStyles(theme => ({
    fab: {
      margin: theme.spacing(1)
    },
    extendedIcon: {
      marginRight: theme.spacing(1)
    }
  }));

  const classes = useStyles();

  const loadMore = () => {
    let toSkip = skip + limit;
    // console.log(newFilters);
    getFilteredProducts(toSkip, limit, myFilters.filters).then(data => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults([...filteredResults, ...data.data]);
        setSize(data.size);
        setSkip(toSkip);
      }
    });
  };

  const loadMoreButton = () => {
    return (
      size > 0 &&
      size >= limit && (
        <Fab
          onClick={loadMore}
          variant="extended"
          aria-label="delete"
          className={classes.fab}
        >
          <NavigationIcon className={classes.extendedIcon} />
          Load more
        </Fab>
      )
    );
  };

  useEffect(() => {
    init();
    loadFilteredResults(skip, limit, myFilters.filters);
  }, []);

  const handleFilters = (filters, filterBy) => {
    console.log("SHOP", filters, filterBy);
    const newFilters = { ...myFilters };
    newFilters.filters[filterBy] = filters;

    if (filterBy === "price") {
      let priceValues = handlePrice(filters);
      newFilters.filters[filterBy] = priceValues;
    }
    loadFilteredResults(myFilters.filters);
    setMyFilters(newFilters);
  };

  const handlePrice = value => {
    const data = prices;
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value)) {
        array = data[key].array;
      }
    }
    return array;
  };

  return (
    <BookhouseLayout
      title="Shop Page"
      description="Search and find books of your choice"
      className="container-fluid"
    >
      <Carousal></Carousal>
      <div id="shoppage" className="row">
        <div className="col-xs-6 col-md-2">
          <h3>Filter by categories</h3>
          <ul>
            <CategoryCheckbox
              bookhousecategories={bookhousecategories}
              handleFilters={filters =>
                handleFilters(filters, "bookhousecategory")
              }
            />
          </ul>

          <br></br>
          <h3>Filter by price range</h3>
          <div id="pricebox">
            <PriceRadioBox
              prices={prices}
              handleFilters={filters => handleFilters(filters, "price")}
            />
          </div>
        </div>
        <div id="gap" className="col-xs-6 col-md-2"></div>

        <div className="col-xs-6 col-md-8">
          <h3>Products</h3>
          <div>
            {filteredResults.map((bookhouseproduct, i) => (
              <div key={i}>
                <BookShopCard bookhouseproduct={bookhouseproduct} />
              </div>
            ))}
          </div>
          <hr />
          {loadMoreButton()}
        </div>
      </div>
    </BookhouseLayout>
  );
};

export default BookShop;
