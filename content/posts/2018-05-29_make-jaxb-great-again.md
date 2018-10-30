---
title: Make JAXB great again!
subTitle: Setup JAXB to generate a fluent builder API and use java.time classes
tags: ["java", "jdk8", "jaxb", "java.time", "maven", "builder pattern"]
cover: /img/java.png
postAuthor: Maciej Papież
---

## TL;DR

You don't need to suffer from headache when working with JAXB-generated classes.
Add a `java.time` adapter and amend the DTOs with fluent builder API instead.

## Intro

Our team is creating a bi-directional integration with a third party company
(which is a partner of our customer). One of the interfaces is defined by an XSD schema - the files
will be transferred daily via SFTP.

## JAXB: 1st attempt

We decided to create a new JAR artifact that will use `cxf-xjc-plugin` maven plugin
to generate Java classes from XSD schema files. A bit of configuration and here
it is - a ready dependency to be included wherever we need it.

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.cxf</groupId>
      <artifactId>cxf-xjc-plugin</artifactId>
      <version>3.2.1</version>
      <configuration>
        <extensions>
          <extension>org.apache.cxf.xjcplugins:cxf-xjc-dv:3.2.1</extension>
        </extensions>
      </configuration>
      <executions>
        <execution>
          <id>generate-sources</id>
          <phase>generate-sources</phase>
          <goals>
            <goal>xsdtojava</goal>
          </goals>
          <configuration>
            <sourceRoot>${basedir}/target/generated/src/main/java</sourceRoot>
            <xsdOptions>
              <xsdOption>
                <xsd>${basedir}/src/main/resources/xsd/integration.xsd</xsd>
                <packagename>software.xsolve.example</packagename>
                <extensionArgs>
                  <extensionArg>-Xdv</extensionArg>
                </extensionArgs>
              </xsdOption>
            </xsdOptions>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>

```

I've started the implementation and quite soon it turned out to be cumbersome.
Although the data structure is _only_ 4 levels deep, building the tree using
constructors + setters was not pleasant at all. There's no indentation that keeps
everything organized, there's a lot of boilerplate code... let's try to improve it!

## Maybe JAXB could generate a builder?

Well, yes! A quick google search of ["jaxb builder"](https://www.google.com/search?q=jaxb+builder)
will guide you to [this StackOverflow post](https://stackoverflow.com/a/22586244/969463),
where Mirko Klemm promotes a set of [JAXB plugins](https://github.com/mklemm/jaxb2-rich-contract-plugin)
that he created by himself.

When you jump to the repository, there's [a nice documentation](http://mklemm.github.io/jaxb2-rich-contract-plugin/)
available. Two plugins seemed interesting for me:

* fluent-builder: Generates a builder class for every class generated,
* immutable: Will make generated classes immutable.

All right, let's plug them in! ;)

1. Add an appropriate _extension_ to your `pom.xml` file to grab the dependency
(kind of):
    ```
    <extension>net.codesup.util:jaxb2-rich-contract-plugin:1.18.0</extension>
    ```
This goes into `build.plugins.configuration.extensions`.

1. Add two _extensionArg_ elements in order to enable chosen plugins (consult
  the docs in order to find the required flags for other plugins):
    ```
    <extensionArg>-Xfluent-builder</extensionArg>
    <extensionArg>-Ximmutable</extensionArg>
    ```
This, on the other hand, goes into `build.plugins.executions.configuration.xsdOptions.extensionArgs`.

So far so good! After a quick `mvn clean install` we can exploit a great, fluent
builder API for object construction. A quick demo:

```Java
final Region region = Region.builder()
    .withCompany(EntityIdentifier.builder()
        .withIdentifier("Facebook LTD")
        .withType(EntityTypeCode.LTD)
        .withName("Facebook")
        .build())
    .addEmployee(EntityIdentifier.builder()
        .withIdentifier("123456")
        .withType(EntityTypeCode.CONTRACTOR)
        .withName("John Doe")
        .build())
    .build();
```

Sweet & fun to use, don't you think?

## Go away, `XMLGregorianCalendar`! Come here, `java.time`!

After a while, I noticed that by default, `xs:dateTime` are converted
into `XMLGregorianCalendar` objects. Nobody likes to deal with old Java date/time
APIs... unless we convert them to JodaTime or `java.time` ;)

Can it we done with JAXB?

Again, a bit of [googling](https://www.google.com/search?q=jaxb+java+8+time)
and I stumbled upon a blog post by [@gdpotter](https://twitter.com/gdpotter), entitled
[Using Java 8 Time within JAXB with JXC](http://gdpotter.com/2017/09/21/jaxb-java-time/).
Hey, that's exactly what I need! In his artice, he performs a short demo of [jaxb-java-time-adapters](https://github.com/migesok/jaxb-java-time-adapters) library,
created by [@migesok](https://twitter.com/migesok). The blog post is based on Gradle,
let's port it to Maven world.

This small lib is a set of adapters that you can ask JAXB to use while generating
your classes. How?

1. Add a dependency to your pom.xml.
    ```xml
    <dependency>
      <groupId>com.migesok</groupId>
      <artifactId>jaxb-java-time-adapters</artifactId>
      <version>1.1.3</version>
    </dependency>
    ```

1. Add a `src/main/resources/binding.xml` file that defines which adapters should be used.
    ```xml
    <bindings xmlns="http://java.sun.com/xml/ns/jaxb" version="2.1"
      xmlns:xjc="http://java.sun.com/xml/ns/jaxb/xjc">

      <globalBindings>
        <xjc:javaType name="java.time.OffsetDateTime" xmlType="xs:dateTime"
          adapter="com.migesok.jaxb.adapter.javatime.OffsetDateTimeXmlAdapter"/>
      </globalBindings>

    </bindings>
    ```

1. Setup the bindings file in pom.xml and make sure that JAXB extensions are enabled.
In our scenarion, two lines have to be added to the `xsdOption` section:

    ```xml
    <bindingFile>${basedir}/src/main/resources/binding.xml</bindingFile>
    <extension>true</extension>
    ```

## The end.

I hope you'll benefit from these two JAXB-related improvements that I just showed
you. Working with JAXB doesn't have to be a pain, we can make it more enjoyable
and up-to-date!

Don't hesitate to [reach out](https://twitter.com/maciejpapiez)! ;)
