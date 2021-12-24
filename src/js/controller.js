import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import addRecipeView from './views/addRecipeView.js';

import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
// import icons from 'url:../img/icons.svg';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addrecipeView from './views/addRecipeView.js';
///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    //// update results view to mark selected search result

    resultsView.update(model.getSearchResultsPage());
    ///updating bookmarks
    bookmarksView.update(model.state.bookmarks);
    ///// 1) loading recipe
    await model.loadRecipe(id);
    // const { recipe } = model.state;
    //// rendring recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //// 1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    ///// 2) load search result
    await model.loadSearchResults(query);

    ///// 3) render results
    resultsView.render(model.getSearchResultsPage());

    //// 4) render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (goToPage) {
  ///// 5) render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //// 6) render new pagination btn
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  ///// update the recipe servings (in the state)

  /// update recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  /// add / remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // console.log(model.state.recipe);
  /// update recipeview
  recipeView.update(model.state.recipe);
  // render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  /// upload the new recipe data
  try {
    addrecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    /// render recipe
    recipeView.render(model.state.recipe);
    //// success message
    addrecipeView.renderMessage();
    //// render the bookmark view
    bookmarksView.render(model.state.bookmarks);
    //// change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    ////close form window
    setTimeout(function () {
      addrecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addrecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addhandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
