Some notes on running this:
* This project assumes node version 22 or later, thought it *might* work with version 21 or 20.
* I am using pnpm for package management.
* Some of the pages require some json that is generated.  To do this you will require some extra commands
  * if you have just[^1] installed globally, you can simply run
    ```just parse```
    ```just dev```
    for a running development instance (the just parse command only needs to be run if the gramps export changes, not every time), or
    ```just build```
    to build something ready to deploy (the build command will call the parse command automatically).
  * otherwise run
    ```pnpm install```
    ```pnpm just parse```
    ```pnpm just dev```
* The ```just dev``` and ```just build``` commands essentially simply call the corresponding pnpm dev and build commands, except that they make sure that the relevant prerequisite commands have also been run first.  the ```just deploy``` command is different, in that it calls pulumi[^2] instead.
* I have not attempted to make this project deployable by anyone else. Someone else looking at this will almost certainly have to modify the pulumi configuration to point to their own stacks if for some reason he or she wanted to do more than test a local build.

[^1]: https://just.systems/
[^2]: https://www.pulumi.com/
