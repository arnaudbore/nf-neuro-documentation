# Pipeline card draft

```
---------------------------------------------------------------------------------------
|                    |                                                                |
|                    |                                                                |
|                    |     [REPOSITORY NAME](documentation or repostiory hyperref)    |
|      pipeline      |                                                                |
|        logo        |      description ...                                           |
|                    |                                                                |
|                    |      topics                                                    |
|                    |                                                                |
---------------------------------------------------------------------------------------
```

Considering the following configuration for a pipeline, rendered here as YAML :

```yaml
pipeline:
    name: "dummy-name"
    organisation: "dummy-org"
```

## The following is required :

1. The `repository.name` is `{pipeline.organisation}/{pipeline.name}`.
2. The **github repository** hosting the pipeline is located at `https://github.com/{repository.name}`.
3. The **documentation** is hosted at `https://{pipeline.organisation}.github.io/{pipeline.name}`.
4. The **pipeline logo** is fetched from the **github repository**, the file named `{pipeline.name}_logo.png` in the **assets** directory.
5. Instead of a single logo, the pipeline's **assets** directory might contain a **light** and **dark** version, named `{pipeline.name}_{light|dark}_logo.png`.
6. If no logo is found, the github logo is displayed instead, fetched from this website's asset directory.
7. The **description** of the pipeline is fetched from the **github repository**, by reading the `README.md` file and stripping everything before the first paragraph, hiding the overflow of the rendered HTML element.
8. The **topics** associated to the pipeline are fetched from the **github repository**, using the **github API**

## Remarks

- We must use the **Github API** to fetch the information about the pipeline from either (A) a pre-formed link to the repository or (B) the pipeline name and it's host Github organisation.
- It should be doable in **typescript**.
- This [unlisted astro plugin](https://github.com/chenasraf/github-repos-astro-loader) uses **typescript** to do that. I tried to use it, but it is **incompatible with the current version of astro** I use.
- I **won't rollback to a previous version of astro**.
- I haven't uninstalled the plugin mentionned above yet, you'll find it in `node_modules`.

## Demand

I want you to implement the `PipelineCard.astro` component following the draft presented here **to the letter**.

1. Create a plan
2. Generate clear and ordered TODOs from that plan
3. Enact the TODOs in order

## Final considerations

- The `PipelineCard` component will be used in the `PipelineScroller` component. You might want to look at it, but it's code is not final. Don't limit yourself to it too much, following the draft is more important.