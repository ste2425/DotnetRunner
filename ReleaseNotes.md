## Version 0.1.7
---

Release highlights:

* Fixed potential memory leak issue

---

# Memory Leak

When teminating an application, either by stoppingit directly or by purging dotnet apps it was possible for some satellite proccess to remain.

These will now be terminated also.

More information can be found [In the Wiki](https://github.com/ste2425/DotnetRunner/wiki/Node-PTY-and-satellite-Dotnet-processes){.open-external}