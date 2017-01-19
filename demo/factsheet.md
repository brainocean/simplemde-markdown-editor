# {{name}}

{{#block "cover_image"}}
![Cover Image]({{profile.coverImage}})
{{/block}}

{{profile.shortDescription}}

### Business Scope


{{#block "red"}}
### Benefits
{{#profile.businessBenefits}}
* {{.}}
{{/profile.businessBenefits}}
{{/block}}

---------

### Software used
{{{profile.softwareRequirements}}}

#### Measurable success
{{#profile.keyCompetitiveDifferentiator}}
* {{.}}
{{/profile.keyCompetitiveDifferentiator}}
