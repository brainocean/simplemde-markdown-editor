# {{name}}

{{#block "cover_image"}}
![Cover Image]({{profile.coverImage}})
{{/block}}

{{profile.shortDescription}}

### Benefits
{{#block "highlight1"}}
{{#profile.businessBenefits}}
* {{.}}
{{/profile.businessBenefits}}
{{/block}}

-----------

### Business Scope
#### Scope items
| ID | Name | Description |
|----|------|-------------|
{{#scopeItems}}
| {{scopeItemId}} | {{name}} | {{shortDescription}} |
{{/scopeItems}}

#### Scope item groups
{{#scopeItemGroups}}
* {{name}}
{{/scopeItemGroups}}

---------

### Software used
{{{profile.softwareRequirements}}}

### Measurable success
{{#profile.keyCompetitiveDifferentiator}}
* {{.}}
{{/profile.keyCompetitiveDifferentiator}}
