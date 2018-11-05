---
title: Naming Sass color variables
subTitle: My approach to name color variables
tags: ["sass", "styles", "colors", "naming", "variables"]
cover: /img/sass.svg
postAuthor: Krzysztof Grziwok
---

# Introduction

Sass is great tool, besides many great features, it gives us ability to declare a custom variables and use it across the project.
One of the basic use of variables in stylesheets are the colors in our application.
There are many ways to implement this, however not all stand the test of time.
In this short post I will show you my personal approach which I used in a few projects and it worked pretty well.

# Problem

When we start a new project, we tend to start small and we usually forget about scalability of our variables or maps.
The most common use case which I spot in projects, is that we name colors as they are represented visually by the name of primary color.

```css
$blue: #2B42E9;
$grey: #D6D7E1;
$dark: #010105;
```

Above implementation works, but only in small projects where style guide contains only a few variations of colors.
What about rapidly growing projects with literally tons of color variants?
We don't even know when things can turn into something like this:

```css
$blue: #2B42E9;
$blue-dark: #10174C;
$grey: #D6D7E1;
$grey-light: $EFF0F5;
$grey-lightest: #EAECF5;
$dark: #010105;
```

I bet we all know this situation when graphic designer uses a new color and we don't really know how to name it because we can't think of new name for it.

# Solution

Some time ago I started to name colors as they are originally named.
It will gives us a unique name for each variable which will organize all the colors in our application with logical order.
Of course we don't know all the names so we can use tools like http://chir.ag/projects/name-that-color to get a name.
After all our IDE will display small square filled with color next to variable with hex.

```css
$royal-blue: #2B42E9;
$blue-zodiac: #10174C;
$mischka: #D6D7E1;
$athens-gray: #EFF0F5;
$whisper: #EAECF5;
$black-pearl: #010105;
```


This approach works with styles in javascript or other preprocessors.
We can modify our final solution to transform it into map of colors and brand colors which we will use for our application's palette.

```css
$colors: (
  royal-blue: #2B42E9,
  blue-zodiac: #10174C,
  mischka: #D6D7E1,
  athens-gray: #EFF0F5,
  whisper: #EAECF5,
  black-pearl: #010105,
  red-ribbon: #F0192E,
);

$brand-colors: (
  primary: map-get($colors, 'royal-blue'),
  danger: map-get($colors, 'red-ribbon'),
);
```
